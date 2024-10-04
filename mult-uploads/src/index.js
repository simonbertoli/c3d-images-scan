// @ts-check
import * as cornerstone from "@cornerstonejs/core";
import * as cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import * as cornerstoneTools from "@cornerstonejs/tools";
import * as dicomParser from "dicom-parser";
import {
  convertMultiframeImageIds,
  prefetchMetadataInformation,
} from "./convertMultiframeImageIds";

cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
cornerstoneDICOMImageLoader.configure({
  // useWebWorkers: true,
  /**
   * Required for Cornerstone 3D
   */
  decodeConfig: {
    convertFloatPixelDataToInt: false,
  },
});

let viewport;
const toolGroupId = "STACK_TOOL_GROUP_ID";

const element = document.getElementById("cornerstone");

document.getElementById("selectFile").addEventListener("change", function (e) {
  const files = e.target.files;
  const imageIds = Array.from(files).map((file) =>
    cornerstoneDICOMImageLoader.wadouri.fileManager.add(file),
  );
  loadAndViewImages(...imageIds);
});

document.getElementById("pan").addEventListener("click", (e) => {
  const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);
  toolGroup.setToolPassive(cornerstoneTools.StackScrollMouseWheelTool.toolName);
  toolGroup.setToolPassive(cornerstoneTools.LengthTool.toolName);
  toolGroup.setToolActive(cornerstoneTools.PanTool.toolName, {
    bindings: [
      {
        mouseButton: cornerstoneTools.Enums.MouseBindings.Primary, // Left Click
      },
    ],
  });
});

document.getElementById("scroll-image").addEventListener("click", (e) => {
  const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);
  toolGroup.setToolPassive(cornerstoneTools.LengthTool.toolName);
  toolGroup.setToolPassive(cornerstoneTools.PanTool.toolName);
  toolGroup.setToolActive(cornerstoneTools.StackScrollMouseWheelTool.toolName, {
    bindings: [
      {
        mouseButton: cornerstoneTools.Enums.MouseBindings.Primary, // Left Click
      },
    ],
  });
});

/**
 * Runs the demo
 */
async function run() {
  // Init Cornerstone and related libraries
  await cornerstone.init();
  cornerstoneTools.init();
  cornerstoneTools.addTool(cornerstoneTools.LengthTool);
  cornerstoneTools.addTool(cornerstoneTools.PanTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);

  // Instantiate a rendering engine
  const renderingEngineId = "myRenderingEngine";
  const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);

  // Create a stack viewport
  const viewportId = "CT_STACK";
  const viewportInput = {
    viewportId,
    type: cornerstone.Enums.ViewportType.STACK,
    element,
  };

  const toolGroup = new cornerstoneTools.ToolGroupManager.createToolGroup(
    toolGroupId,
  );

  toolGroup.addTool(cornerstoneTools.LengthTool.toolName);
  toolGroup.addTool(cornerstoneTools.PanTool.toolName);
  toolGroup.addTool(cornerstoneTools.StackScrollMouseWheelTool.toolName);

  const a = () => {
    console.log("🚀 ~ a ~ toolGroup:", toolGroup);
  };

  renderingEngine.enableElement(viewportInput);

  viewport = renderingEngine.getViewport(viewportId);
  toolGroup.addViewport(viewportId);

  toolGroup.setToolActive(cornerstoneTools.LengthTool.toolName, {
    bindings: [
      {
        mouseButton: cornerstoneTools.Enums.MouseBindings.Primary, // Left Click
      },
    ],
  });
}
run();

async function loadAndViewImages(...imageIds) {
  const stacks = [];
  await Promise.all(
    imageIds.map((imageId) => prefetchMetadataInformation([imageId])),
  );
  for (const imageId of imageIds) {
    stacks.push(convertMultiframeImageIds([imageId]));
  }
  await viewport.setStack(stacks.flat());

  viewport.render();
}
