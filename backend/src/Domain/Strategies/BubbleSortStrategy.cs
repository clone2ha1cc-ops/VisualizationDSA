using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class BubbleSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "bubble-sort";
    public override string Name => "Bubble Sort (Sắp xếp nổi bọt)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N²)",
            SpaceComplexity = "O(1)",
            Description = "Bubble Sort so sánh hai phần tử liền kề và hoán đổi nếu chúng không đúng thứ tự. Lặp lại cho đến khi mảng được sắp xếp hoàn toàn.",
            PseudoCode = new List<string>
            {
                "for i from 0 to N-1",
                "  for j from 0 to N-i-2",
                "    if A[j] > A[j+1]",
                "      swap(A[j], A[j+1])"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        List<int> sortedIndices = new();

        CaptureState(arr, 0, "Bắt đầu khởi chạy giải thuật Bubble Sort.");

        for (int i = 0; i < n - 1; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            for (int j = 0; j < n - i - 1; j++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                CaptureState(arr, 2,
                    $"So sánh A[{j}] ({arr[j]}) và A[{j + 1}] ({arr[j + 1]})",
                    compares: new List<int> { j, j + 1 },
                    sorted: new List<int>(sortedIndices));

                if (arr[j] > arr[j + 1])
                {
                    (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);

                    CaptureState(arr, 3,
                        $"Hoán đổi A[{j}] ({arr[j]}) và A[{j + 1}] ({arr[j + 1]})",
                        swaps: new List<int> { j, j + 1 },
                        sorted: new List<int>(sortedIndices));
                }
            }

            sortedIndices.Add(n - i - 1);
            CaptureState(arr, 0,
                $"Phần tử {arr[n - i - 1]} đã cố định tại index {n - i - 1}.",
                sorted: new List<int>(sortedIndices));
        }

        sortedIndices.Add(0);
        CaptureState(arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: new List<int>(sortedIndices));

        return _frames;
    }
}
