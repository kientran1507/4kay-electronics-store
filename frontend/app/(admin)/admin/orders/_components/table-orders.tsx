"use client";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import formatDate, { sortByDate } from "@/app/utils/formateDate";
import ReactPaginate from "react-paginate";
import { useState } from "react";
import TitleHeader from "@/app/(admin)/components/title-header";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi } from "@/lib/apiCalls";
import { Order } from "@/types";
import { toast } from "react-hot-toast";
import formatVND from "@/app/utils/formatCurrency";

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Chờ thanh toán':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Chờ xử lý':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Đang giao':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: Order['paymentStatus'] }) => {
  const styles = status === 'paid'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles}`}>
      {status || 'unpaid'}
    </span>
  );
};

const TableOrders = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const odersPerPage = 10;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const protectedApi = user ? createProtectedApi(user.token) : null;

  const { data, isLoading, error } = useQuery<{ message: string, orders: Order[] }>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!protectedApi) throw new Error("Not authenticated");
      const response = await protectedApi.admin.getAllOrders();
      return response;
    },
    enabled: !!protectedApi
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      if (!protectedApi) throw new Error("Not authenticated");
      return await protectedApi.admin.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Order status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update order status");
    }
  });

  const offset = currentPage * odersPerPage;
  const orders = data?.orders || [];
  const currentProducts = orders.slice(offset, offset + odersPerPage);

  const handlePageClick = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  if (isLoading) return <Spinner />;
  if (error) return <p>Something went wrong!</p>;

  return (
    <>
      <TitleHeader
        title="Orders"
        count={orders.length}
        description="Manage orders for your store"
      />
      <TableContainer component={Paper} className="shadow-md">
        <Table sx={{ minWidth: 650 }} aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell>Products</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentProducts?.map((order) => (
              <TableRow 
                key={order._id}
                className="hover:bg-gray-50"
              >
                <TableCell>{order.items.length} items</TableCell>
                <TableCell className="font-medium">
                  {formatVND(order.totalPrice)}
                </TableCell>
                <TableCell>{order.shippingAddress}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {order.paymentMethod}
                  </span>
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) => updateStatusMutation.mutate({
                      orderId: order._id,
                      status: e.target.value as Order['status']
                    })}
                    size="small"
                    className="min-w-[180px]"
                    renderValue={(value) => <StatusBadge status={value as Order['status']} />}
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                  >
                    <MenuItem value="Chờ thanh toán">
                      <StatusBadge status="Chờ thanh toán" />
                    </MenuItem>
                    <MenuItem value="Chờ xử lý">
                      <StatusBadge status="Chờ xử lý" />
                    </MenuItem>
                    <MenuItem value="Đang giao">
                      <StatusBadge status="Đang giao" />
                    </MenuItem>
                    <MenuItem value="Hoàn thành">
                      <StatusBadge status="Hoàn thành" />
                    </MenuItem>
                    <MenuItem value="Đã hủy">
                      <StatusBadge status="Đã hủy" />
                    </MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(new Date(order.createdAt).toISOString())}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {orders.length > 0 && (
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          pageCount={Math.ceil(orders.length / odersPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination flex space-x-2 justify-end mt-4"}
          previousLinkClassName={"bg-neutral-800 px-4 py-2 rounded text-white"}
          nextLinkClassName={"bg-neutral-800 px-4 py-2 rounded text-white"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          activeClassName={"bg-blue-700"}
          pageClassName="hidden"
        />
      )}
    </>
  );
};

export default TableOrders;
