using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class QuickSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "quick-sort";
    public override string Name => "Quick Sort (Sắp xếp nhanh)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N log N)",
            SpaceComplexity = "O(log N)",
            Description = "Quick Sort hoạt động theo nguyên lý chia để trị. Chọn một phần tử làm chốt (Pivot), phân chia mảng thành hai nửa sao cho một nửa nhỏ hơn chốt và nửa kia lớn hơn chốt, sau đó đệ quy sắp xếp từng nửa.",
            PseudoCode = new List<string>
            {
                "quickSort(A, low, high)",
                "  if low < high",
                "    pivotIdx = partition(A, low, high)",
                "    quickSort(A, low, pivotIdx - 1)",
                "    quickSort(A, pivotIdx + 1, high)",
                "partition(A, low, high)",
                "  pivot = A[high]",
                "  i = low - 1",
                "  for j from low to high-1",
                "    if A[j] < pivot",
                "      i++; swap(A[i], A[j])",
                "  swap(A[i+1], A[high])",
                "  return i+1"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();

        CaptureQuickFrame(arr, 0, "Khởi tạo mảng đầu vào và chuẩn bị sắp xếp nhanh.");

        RunQuickSort(arr, 0, arr.Length - 1, cancellationToken);

        var sortedIndices = Enumerable.Range(0, arr.Length).ToList();
        CaptureState(arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: sortedIndices);

        return _frames;
    }

    private void RunQuickSort(int[] arr, int low, int high, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (low < high)
        {
            int pivotIdx = Partition(arr, low, high, cancellationToken);
            RunQuickSort(arr, low, pivotIdx - 1, cancellationToken);
            RunQuickSort(arr, pivotIdx + 1, high, cancellationToken);
        }
    }

    private int Partition(int[] arr, int low, int high, CancellationToken cancellationToken)
    {
        int pivot = arr[high];
        int i = low - 1;

        CaptureQuickFrame(arr, 6,
            $"Chọn phần tử cuối cùng làm chốt Pivot: {pivot} (index {high})",
            pivotIdx: high);

        for (int j = low; j < high; j++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            CaptureQuickFrame(arr, 9,
                $"So sánh A[{j}] ({arr[j]}) với Pivot ({pivot})",
                pivotIdx: high,
                compareIdxs: new List<int> { j });

            if (arr[j] < pivot)
            {
                i++;
                CaptureQuickFrame(arr, 10,
                    $"A[{j}] ({arr[j]}) < Pivot. Hoán vị A[{i}] ({arr[i]}) và A[{j}] ({arr[j]})",
                    pivotIdx: high,
                    swapIdxs: new List<int> { i, j });

                (arr[i], arr[j]) = (arr[j], arr[i]);
            }
        }

        CaptureQuickFrame(arr, 11,
            $"Đưa Pivot về đúng vị trí. Hoán vị A[{i + 1}] ({arr[i + 1]}) và A[{high}] ({arr[high]})",
            pivotIdx: high,
            swapIdxs: new List<int> { i + 1, high });

        (arr[i + 1], arr[high]) = (arr[high], arr[i + 1]);

        return i + 1;
    }

    private void CaptureQuickFrame(
        int[] arr,
        int activeLine,
        string explanation,
        int pivotIdx = -1,
        List<int>? compareIdxs = null,
        List<int>? swapIdxs = null)
    {
        var highlights = new HighlightIndices
        {
            Compare = compareIdxs ?? new List<int>(),
            Swap = swapIdxs ?? new List<int>(),
            Sorted = new List<int>(),
            Pivot = pivotIdx >= 0 ? pivotIdx : null
        };

        _frames.Add(new FrameDTO
        {
            StepId = _frames.Count + 1,
            ActiveLine = activeLine,
            Explanation = explanation,
            DataState = (int[])arr.Clone(),
            Highlights = highlights
        });
    }
}
