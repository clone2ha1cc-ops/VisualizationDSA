using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class MergeSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "merge-sort";
    public override string Name => "Merge Sort (Sắp xếp trộn)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N log N)",
            SpaceComplexity = "O(N)",
            Description = "Merge Sort chia mảng thành hai nửa đệ quy cho đến khi chỉ còn 1 phần tử, sau đó trộn các nửa đã sắp xếp lại với nhau.",
            PseudoCode = new List<string>
            {
                "mergeSort(A, left, right)",
                "  if left < right",
                "    mid = (left + right) / 2",
                "    mergeSort(A, left, mid)",
                "    mergeSort(A, mid+1, right)",
                "    merge(A, left, mid, right)",
                "merge(A, left, mid, right)",
                "  create temp arrays L[], R[]",
                "  copy data to L[] and R[]",
                "  merge L[] and R[] back to A[]"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();

        CaptureState(arr, 0, "Bắt đầu Merge Sort — chia mảng đệ quy.");

        MergeSort(arr, 0, arr.Length - 1, cancellationToken);

        CaptureState(arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: Enumerable.Range(0, arr.Length).ToList());

        return _frames;
    }

    private void MergeSort(int[] arr, int left, int right, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (left < right)
        {
            int mid = (left + right) / 2;

            CaptureState(arr, 2,
                $"Chia mảng tại mid = {mid}: [{left}..{mid}] và [{mid + 1}..{right}]",
                compares: new List<int> { mid });

            MergeSort(arr, left, mid, cancellationToken);
            MergeSort(arr, mid + 1, right, cancellationToken);
            Merge(arr, left, mid, right, cancellationToken);
        }
    }

    private void Merge(int[] arr, int left, int mid, int right, CancellationToken cancellationToken)
    {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        int[] leftArr = new int[n1];
        int[] rightArr = new int[n2];

        Array.Copy(arr, left, leftArr, 0, n1);
        Array.Copy(arr, mid + 1, rightArr, 0, n2);

        CaptureState(arr, 7,
            $"Trộn hai nửa: [{left}..{mid}] và [{mid + 1}..{right}]",
            compares: Enumerable.Range(left, right - left + 1).ToList());

        int i = 0, j = 0, k = left;

        while (i < n1 && j < n2)
        {
            cancellationToken.ThrowIfCancellationRequested();
            CaptureState(arr, 9,
                $"So sánh L[{i}] ({leftArr[i]}) và R[{j}] ({rightArr[j]})",
                compares: new List<int> { k });

            if (leftArr[i] <= rightArr[j])
            {
                arr[k] = leftArr[i];
                i++;
            }
            else
            {
                arr[k] = rightArr[j];
                j++;
            }

            CaptureState(arr, 9,
                $"Đặt giá trị {arr[k]} vào vị trí {k}.",
                swaps: new List<int> { k });
            k++;
        }

        while (i < n1)
        {
            cancellationToken.ThrowIfCancellationRequested();
            arr[k] = leftArr[i];
            CaptureState(arr, 9,
                $"Chép phần tử còn lại L[{i}] = {leftArr[i]} vào vị trí {k}.",
                swaps: new List<int> { k });
            i++;
            k++;
        }

        while (j < n2)
        {
            cancellationToken.ThrowIfCancellationRequested();
            arr[k] = rightArr[j];
            CaptureState(arr, 9,
                $"Chép phần tử còn lại R[{j}] = {rightArr[j]} vào vị trí {k}.",
                swaps: new List<int> { k });
            j++;
            k++;
        }
    }
}
