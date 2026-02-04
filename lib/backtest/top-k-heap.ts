import type { BacktestResultSummary } from './types';

export class TopKHeap {
  private heap: BacktestResultSummary[] = [];
  private readonly k: number;

  constructor(k: number) {
    this.k = k;
  }

  insert(result: BacktestResultSummary): void {
    if (result.isLiquidated) return;

    if (this.heap.length < this.k) {
      this.heap.push(result);
      this.bubbleUp(this.heap.length - 1);
    } else if (result.totalReturn > this.heap[0].totalReturn) {
      this.heap[0] = result;
      this.bubbleDown(0);
    }
  }

  getResults(): BacktestResultSummary[] {
    return [...this.heap].sort((a, b) => b.totalReturn - a.totalReturn);
  }

  get size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].totalReturn <= this.heap[index].totalReturn) break;
      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild].totalReturn < this.heap[smallest].totalReturn) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].totalReturn < this.heap[smallest].totalReturn) {
        smallest = rightChild;
      }

      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
