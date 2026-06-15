"use client";

import { KioskComparison } from "@/types";

const KioskComparisonPanel = ({ comparison }: { comparison?: KioskComparison }) => {
  if (!comparison || comparison.products.length < 2) return null;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="border-b px-4 py-3 text-sm font-semibold text-gray-950">Comparison</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Best for</th>
              <th className="px-3 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {comparison.products.map((item) => (
              <tr key={item.product._id} className="border-t">
                <td className="px-3 py-2 font-medium">{item.product.name}</td>
                <td className="px-3 py-2">{item.product.price.toLocaleString("vi-VN")} VND</td>
                <td className="px-3 py-2">{item.bestFor?.[0] || "Balanced use"}</td>
                <td className="px-3 py-2">{item.scoreDetails.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t px-4 py-3 text-xs text-gray-700">{comparison.summary}</p>
    </div>
  );
};

export default KioskComparisonPanel;
