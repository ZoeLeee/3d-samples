import fs from "fs";
import path from "path";
import initOpenCascade from "opencascade.js/dist/node.js";

const loadSTEPorIGES = async (openCascade, file, fileName) => {
  const fileText = fs.readFileSync(file.path, "utf8");

  const fileType = (() => {
    switch (fileName.toLowerCase().split(".").pop()) {
      case "step":
      case "stp":
        return "step";
      case "iges":
      case "igs":
        return "iges";
      default:
        return undefined;
    }
  })();
  // Writes the uploaded file to Emscripten's Virtual Filesystem
  openCascade.FS.createDataFile("/", `file.${fileType}`, fileText, true, true);

  // Choose the correct OpenCascade file parsers to read the CAD file
  var reader = null;
  if (fileType === "step") {
    reader = new openCascade.STEPCAFControl_Reader_1();
  } else if (fileType === "iges") {
    reader = new openCascade.IGESCAFControl_Reader_1();
  } else {
    console.error("opencascade.js can't parse this extension! (yet)");
  }

  const readResult = reader.ReadFile(`file.${fileType}`); // Read the file

  if (readResult === openCascade.IFSelect_ReturnStatus.IFSelect_RetDone) {
    console.log("file loaded successfully!     Converting to OCC now...");
    //const numRootsTransferred = reader.TransferRoots(new openCascade.Message_ProgressRange_1());    // Translate all transferable roots to OpenCascade

    // Create a document add our shapes
    const doc = new openCascade.TDocStd_Document(
      new openCascade.TCollection_ExtendedString_1()
    );

    if (fileType === "step") {
      if (
        !reader.Transfer_1(
          new openCascade.Handle_TDocStd_Document_2(doc),
          new openCascade.Message_ProgressRange_1()
        )
      )
        throw new Error();
    } else {
      if (
        !reader.Transfer(
          new openCascade.Handle_TDocStd_Document_2(doc),
          new openCascade.Message_ProgressRange_1()
        )
      )
        throw new Error();
    }

    // Obtain the results of translation in one OCCT shape
    console.log(fileName + " converted successfully!  Triangulating now...");

    return visualizeShapes(openCascade, doc, fileName, fileType);
  } else {
    console.error("Something in OCCT went wrong trying to read " + fileName);
  }
};

function visualizeDoc(oc, doc, fileName, fileType) {
  const justName = path.parse(fileName).name;
  // Export a GLB file (this will also perform the meshing)
  const cafWriter = new oc.RWGltf_CafWriter(
    new oc.TCollection_AsciiString_2(`./${justName}.glb`),
    true
  );
  cafWriter.Perform_2(
    new oc.Handle_TDocStd_Document_2(doc),
    new oc.TColStd_IndexedDataMapOfStringString_1(),
    new oc.Message_ProgressRange_1()
  );

  // Out with the old, in with the new!
  console.log(fileName + " triangulated and added to the scene!");

  // Remove the file when we're done (otherwise we run into errors on reupload)
  oc.FS.unlink(`/file.${fileType}`);
  // Read the GLB file from the virtual file system
  const glbFile = oc.FS.readFile(`./${justName}.glb`, { encoding: "binary" });

  const writePath = path.resolve(
    process.cwd(),
    `./public/upload/${justName}.glb`
  );

  fs.writeFileSync(writePath, glbFile);

  return `${justName}.glb`;
}

function visualizeShapes(oc, doc, fileName, fileType) {
  const aRootLabels = new oc.TDF_LabelSequence_1();
  const aCompound = new oc.TopoDS_Compound();
  const shapeTool = oc.XCAFDoc_DocumentTool.ShapeTool(doc.Main()).get();

  shapeTool.GetFreeShapes(aRootLabels);

  const BRepBuilder = new oc.BRep_Builder();

  BRepBuilder.MakeCompound(aCompound);

  for (let i = 1; i <= aRootLabels.Length(); i++) {
    const aRootShape = new oc.TopoDS_Shape();
    const aRootLabel = aRootLabels.Value(i);

    if (oc.XCAFDoc_ShapeTool.GetShape_1(aRootLabel, aRootShape)) {
      BRepBuilder.Add(aCompound, aRootShape);
    }
  }

  const aDrawer = new oc.Prs3d_Drawer();

  const BoundBox = new oc.Bnd_Box_1();

  oc.BRepBndLib.Add(aCompound, BoundBox, false);

  const anAlgo = new oc.BRepMesh_IncrementalMesh_2(
    aCompound,
    oc.Prs3d.GetDeflection_2(
      BoundBox,
      aDrawer.MaximalChordialDeviation(),
      aDrawer.DeviationCoefficient()
    ),
    false,
    (20.0 * Math.PI) / 180.0,
    true
  );

  anAlgo.Perform_1(new oc.Message_ProgressRange_1());

  console.log(doc);
  // Return our visualized document
  return visualizeDoc(oc, doc, fileName, fileType);
}

export const convertSTEPorIGES = async (file) => {
  const openCascade = await initOpenCascade();

  return loadSTEPorIGES(openCascade, file, file.filename);
};
