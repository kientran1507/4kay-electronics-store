export interface SupportFaq {
  question: string;
  answer: string;
}

export interface SupportTopic {
  id: string;
  title: string;
  description: string;
  faqs: SupportFaq[];
}

export const supportTopics: SupportTopic[] = [
  {
    id: "orders",
    title: "Order Tracking",
    description: "Track your order status and delivery updates.",
    faqs: [
      { question: "How can I track my order?", answer: "Sign in and open My Orders to view the latest status for each order. If you cannot sign in, contact support with your order code." },
      { question: "Why has my order not updated?", answer: "Carrier updates can take several hours to appear. If the status has not changed for more than two business days, contact support with the order code." },
      { question: "Can I change my delivery address after ordering?", answer: "Contact support as soon as possible. An address can only be changed before the order enters the delivery stage." },
    ],
  },
  {
    id: "returns",
    title: "Returns",
    description: "Learn about our return and refund process.",
    faqs: [
      { question: "What is your return policy?", answer: "Eligible products can be requested for return within 14 days when they are complete, undamaged, and include the original accessories and packaging." },
      { question: "How do I request a return?", answer: "Open My Orders, identify the order, then contact support with the order code and the reason for the return." },
      { question: "How long does a refund take?", answer: "After the returned product is inspected, refunds usually take 5–10 business days depending on the payment provider." },
    ],
  },
  {
    id: "warranty",
    title: "Warranty",
    description: "Find information about product warranties.",
    faqs: [
      { question: "How long is the warranty?", answer: "Warranty length depends on the product and manufacturer. Check the product details or contact support before purchase for confirmation." },
      { question: "What does the warranty cover?", answer: "Manufacturer warranties generally cover verified hardware faults under normal use, not accidental damage, misuse, or unauthorized repair." },
      { question: "How do I claim warranty service?", answer: "Prepare your order information and a description of the fault, then contact support. Keep the product serial number and included accessories available." },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    description: "Payment methods, billing, and security.",
    faqs: [
      { question: "Which payment methods do you accept?", answer: "The checkout supports cash on delivery and bank-transfer or QR payment when the configured payment provider is available." },
      { question: "Is online payment secure?", answer: "Payment requests are created by the backend and processed through the configured payment provider. The store does not expose provider keys in the browser." },
      { question: "Can I pay on delivery?", answer: "Yes. Choose cash on delivery during checkout when it is available for your order." },
    ],
  },
  {
    id: "account",
    title: "Account",
    description: "Manage sign-in, profile, and order history.",
    faqs: [
      { question: "How do I reset my password?", answer: "Password reset is not automated yet. Use the Forgot Password page to see support options, or contact support using the email registered to your account." },
      { question: "How do I update my account information?", answer: "Sign in and use your account profile when available. Contact support if a field cannot be changed from the current interface." },
      { question: "Can I view my order history?", answer: "Yes. After signing in, choose My Orders from the account menu." },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Delivery options, times, and shipping fees.",
    faqs: [
      { question: "How long does delivery take?", answer: "Delivery time depends on location and stock. Most orders should be confirmed before a precise delivery estimate is provided." },
      { question: "How much is shipping?", answer: "The final shipping fee depends on the order and delivery address. Review the checkout summary before confirming payment." },
      { question: "Do you deliver nationwide?", answer: "Delivery coverage depends on the configured carrier. Enter your address during checkout or contact support to confirm remote-area delivery." },
    ],
  },
];

export const supportTopicsVi: SupportTopic[] = [
  { id: "orders", title: "Theo dõi đơn hàng", description: "Theo dõi trạng thái đơn và quá trình giao hàng.", faqs: [
    { question: "Làm thế nào để theo dõi đơn hàng?", answer: "Đăng nhập và mở Đơn hàng của tôi để xem trạng thái mới nhất. Nếu không thể đăng nhập, hãy liên hệ hỗ trợ và cung cấp mã đơn." },
    { question: "Tại sao trạng thái đơn hàng chưa cập nhật?", answer: "Dữ liệu từ đơn vị vận chuyển có thể mất vài giờ để cập nhật. Nếu trạng thái không đổi sau hơn hai ngày làm việc, hãy liên hệ hỗ trợ." },
    { question: "Tôi có thể đổi địa chỉ sau khi đặt hàng không?", answer: "Hãy liên hệ hỗ trợ càng sớm càng tốt. Địa chỉ chỉ có thể thay đổi trước khi đơn chuyển sang giai đoạn giao hàng." },
  ] },
  { id: "returns", title: "Đổi trả", description: "Tìm hiểu quy trình đổi trả và hoàn tiền.", faqs: [
    { question: "Chính sách đổi trả như thế nào?", answer: "Sản phẩm đủ điều kiện có thể yêu cầu đổi trả trong vòng 14 ngày nếu còn nguyên vẹn, đầy đủ phụ kiện và bao bì." },
    { question: "Làm thế nào để yêu cầu đổi trả?", answer: "Mở Đơn hàng của tôi, xác định đơn cần đổi trả rồi liên hệ hỗ trợ với mã đơn và lý do." },
    { question: "Hoàn tiền mất bao lâu?", answer: "Sau khi sản phẩm được kiểm tra, quá trình hoàn tiền thường mất 5–10 ngày làm việc tùy nhà cung cấp thanh toán." },
  ] },
  { id: "warranty", title: "Bảo hành", description: "Thông tin về chính sách bảo hành sản phẩm.", faqs: [
    { question: "Thời hạn bảo hành là bao lâu?", answer: "Thời hạn phụ thuộc vào sản phẩm và nhà sản xuất. Hãy xem chi tiết sản phẩm hoặc liên hệ hỗ trợ để xác nhận." },
    { question: "Bảo hành bao gồm những gì?", answer: "Bảo hành của nhà sản xuất thường áp dụng cho lỗi phần cứng trong điều kiện sử dụng bình thường, không bao gồm hư hỏng do va đập, sử dụng sai hoặc sửa chữa trái phép." },
    { question: "Làm thế nào để yêu cầu bảo hành?", answer: "Chuẩn bị thông tin đơn hàng, số sê-ri và mô tả lỗi rồi liên hệ hỗ trợ." },
  ] },
  { id: "payment", title: "Thanh toán", description: "Phương thức thanh toán, hóa đơn và bảo mật.", faqs: [
    { question: "Cửa hàng chấp nhận phương thức thanh toán nào?", answer: "Bạn có thể thanh toán khi nhận hàng hoặc chuyển khoản/QR qua nhà cung cấp thanh toán được cấu hình." },
    { question: "Thanh toán trực tuyến có an toàn không?", answer: "Yêu cầu thanh toán được tạo ở backend và xử lý bởi nhà cung cấp thanh toán. Khóa bí mật không được gửi ra trình duyệt." },
    { question: "Tôi có thể thanh toán khi nhận hàng không?", answer: "Có. Chọn Thanh toán khi nhận hàng trong bước thanh toán nếu phương thức này khả dụng." },
  ] },
  { id: "account", title: "Tài khoản", description: "Quản lý đăng nhập, hồ sơ và lịch sử mua hàng.", faqs: [
    { question: "Làm thế nào để đặt lại mật khẩu?", answer: "Tính năng đặt lại tự động chưa khả dụng. Hãy sử dụng trang Quên mật khẩu hoặc liên hệ hỗ trợ bằng email đã đăng ký." },
    { question: "Làm thế nào để cập nhật thông tin tài khoản?", answer: "Đăng nhập và sử dụng trang hồ sơ khi khả dụng. Hãy liên hệ hỗ trợ nếu chưa thể thay đổi một trường trong giao diện." },
    { question: "Tôi có thể xem lịch sử đơn hàng không?", answer: "Có. Sau khi đăng nhập, chọn Đơn hàng của tôi trong menu tài khoản." },
  ] },
  { id: "delivery", title: "Giao hàng", description: "Hình thức, thời gian và phí giao hàng.", faqs: [
    { question: "Giao hàng mất bao lâu?", answer: "Thời gian phụ thuộc vào địa điểm và tồn kho. Đơn hàng cần được xác nhận trước khi có thời gian giao chính xác." },
    { question: "Phí giao hàng là bao nhiêu?", answer: "Phí cuối cùng phụ thuộc vào đơn và địa chỉ nhận hàng. Hãy kiểm tra phần tóm tắt trước khi xác nhận thanh toán." },
    { question: "Cửa hàng có giao hàng toàn quốc không?", answer: "Phạm vi phụ thuộc vào đơn vị vận chuyển. Nhập địa chỉ khi thanh toán hoặc liên hệ hỗ trợ để xác nhận khu vực xa." },
  ] },
];

export const supportContext = supportTopics
  .flatMap((topic) => topic.faqs.map((faq) => `${faq.question} ${faq.answer}`))
  .join("\n");
