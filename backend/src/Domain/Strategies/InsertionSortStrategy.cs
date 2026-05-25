using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class InsertionSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "insertion-sort";
    public override string Name => "Insertion Sort (Sắp xếp chèn)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N²)",
            SpaceComplexity = "O(1)",
            Description = "Insertion Sort chèn từng phần tử vào đúng vị trí trong phần đã sắp xếp, giống cách sắp xếp bài trên tay.",
            PseudoCode = new List<string>
            {
                "for i from 1 to N-1",
                "  key = A[i]",
                "  j = i - 1",
                "  while j >= 0 and A[j] > key",
                "    A[j+1] = A[j]",
                "    j = j - 1",
                "  A[j+1] = key"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        List<int> sortedIndices = new() { 0 };

        CaptureState(arr, 0,
            "Bắt đầu Insertion Sort. Phần tử đầu tiên được coi là đã sắp xếp.",
            sorted: new List<int>(sortedIndices));

        for (int i = 1; i < n; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int key = arr[i];
            int j = i - 1;

            CaptureState(arr, 1,
                $"Chọn key = A[{i}] = {key} để chèn vào phần đã sắp xếp.",
                compares: new List<int> { i },
                sorted: new List<int>(sortedIndices));

            while (j >= 0 && arr[j] > key)
            {
                cancellationToken.ThrowIfCancellationRequested();
                CaptureState(arr, 3,
                    $"A[{j}] ({arr[j]}) > key ({key}). Dịch A[{j}] sang phải.",
                    compares: new List<int> { j },
                    sorted: new List<int>(sortedIndices));

                arr[j + 1] = arr[j];
                j--;

                CaptureState(arr, 4,
                    $"Đã dịch phần tử sang vị trí {j + 2}.",
                    swaps: new List<int> { j + 1, j + 2 },
                    sorted: new List<int>(sortedIndices));
            }

            arr[j + 1] = key;
            sortedIndices.Add(i);

            CaptureState(arr, 6,
                $"Chèn key = {key} vào vị trí {j + 1}.",
                swaps: new List<int> { j + 1 },
                sorted: new List<int>(sortedIndices));
        }

        CaptureState(arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: Enumerable.Range(0, n).ToList());

        return _frames;
    }
}
