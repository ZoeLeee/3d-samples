import homeVS from "./home/index.vs?raw";
import homeFS from "./home/index.fs?raw";
import testVS from "./test/index.vs?raw";
import testFS from "./test/index.fs?raw";
import { Effect } from "@babylonjs/core";




Effect.ShadersStore["HomeVertexShader"] = homeVS;
Effect.ShadersStore["HomeFragmentShader"] = homeFS;

Effect.ShadersStore["TestVertexShader"] = testVS;
Effect.ShadersStore["TestFragmentShader"] = testFS;