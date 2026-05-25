import { ref } from "vue";
import { CustomInputParser } from "../CustomInputParser";

export function useInputValidation() {
  const arrayInputText = ref<string>("45, 12, 85, 32, 9, 60");
  const parsedArray = ref<number[]>([]);
  const arrayError = ref<string | null>(null);

  const graphInputText = ref<string>("A-B:10, B-C:20, A-C:50");
  const parsedGraphNodes = ref<Array<{ id: string }>>([]);
  const parsedGraphEdges = ref<
    Array<{ sourceId: string; targetId: string; weight: number }>
  >([]);
  const graphError = ref<string | null>(null);

  const validateArray = () => {
    try {
      arrayError.value = null;
      parsedArray.value = CustomInputParser.parseNumberArray(
        arrayInputText.value
      );
    } catch (err: any) {
      arrayError.value = err.message;
      parsedArray.value = [];
    }
  };

  const validateGraph = () => {
    try {
      graphError.value = null;
      const graph = CustomInputParser.parseAdjacencyList(graphInputText.value);
      parsedGraphNodes.value = graph.nodes;
      parsedGraphEdges.value = graph.edges;
    } catch (err: any) {
      graphError.value = err.message;
      parsedGraphNodes.value = [];
      parsedGraphEdges.value = [];
    }
  };

  return {
    arrayInputText,
    parsedArray,
    arrayError,
    graphInputText,
    parsedGraphNodes,
    parsedGraphEdges,
    graphError,
    validateArray,
    validateGraph,
  };
}
