using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class SelectionSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "selection-sort";
    public override string Name => "Selection Sort (Sắp xếp chọn)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N²)",
            SpaceComplexity = "O(1)",
            Description = "Selection Sort tìm phần tử nhỏ nhất trong phần chưa sắp xếp và hoán đổi với phần tử đầu tiên của phần chưa sắp xếp.",
            PseudoCode = new List<string>
            {
                "for i from 0 to N-1",
                "  minIdx = i",
                "  for j from i+1 to N-1",
                "    if A[j] < A[minIdx]",
                "      minIdx = j",
                "  swap(A[i], A[minIdx])"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        List<int> sortedIndices = new();

        CaptureState(arr, 0, "Bắt đầu khởi chạy giải thuật Selection Sort.");

        for (int i = 0; i < n - 1; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int minIdx = i;
            CaptureState(arr, 1,
                $"Giả định phần tử nhỏ nhất là A[{i}] = {arr[i]}.",
                compares: new List<int> { i },
                sorted: new List<int>(sortedIndices));

            for (int j = i + 1; j < n; j++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                CaptureState(arr, 3,
                    $"So sánh A[{j}] ({arr[j]}) với A[{minIdx}] ({arr[minIdx]})",
                    compares: new List<int> { j, minIdx },
                    sorted: new List<int>(sortedIndices));

                if (arr[j] < arr[minIdx])
                {
                    minIdx = j;
                    CaptureState(arr, 4,
                        $"Cập nhật minIdx = {minIdx}, giá trị nhỏ nhất hiện tại = {arr[minIdx]}",
                        compares: new List<int> { minIdx },
                        sorted: new List<int>(sortedIndices));
                }
            }

            if (minIdx != i)
            {
                (arr[i], arr[minIdx]) = (arr[minIdx], arr[i]);
                CaptureState(arr, 5,
                    $"Hoán đổi A[{i}] và A[{minIdx}]: đưa {arr[i]} về vị trí {i}",
                    swaps: new List<int> { i, minIdx },
                    sorted: new List<int>(sortedIndices));
            }

            sortedIndices.Add(i);
            CaptureState(arr, 0,
                $"Phần tử {arr[i]} đã cố định tại index {i}.",
                sorted: new List<int>(sortedIndices));
        }

        sortedIndices.Add(n - 1);
        CaptureState(arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: new List<int>(sortedIndices));

        return _frames;
    }
}
