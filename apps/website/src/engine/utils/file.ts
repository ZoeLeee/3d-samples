
let chooserInput: HTMLInputElement;

export function chooseFile({
    filter,
    multiple = false,
    callback,
}: {
    filter?: string;
    multiple?: boolean;
    callback: (filelist: FileList) => void;
}) {
    if (chooserInput) chooserInput.remove();

    chooserInput = document.createElement("input");
    chooserInput.type = "file";
    chooserInput.style.display = "none";
    document.body.appendChild(chooserInput);

    chooserInput.accept = filter;
    chooserInput.onchange = () => {
        if (chooserInput.files.length > 0) callback(chooserInput.files);
    };
    chooserInput.multiple = multiple;
    chooserInput.click();
}