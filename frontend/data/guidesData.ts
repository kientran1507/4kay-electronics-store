export interface GuideSection {
  heading: string;
  body: string;
}

export interface BuyingGuide {
  slug: string;
  title: string;
  category: "Guide" | "Review" | "Tips";
  summary: string;
  imageTerms: string[];
  relatedCategory: string;
  sections: GuideSection[];
}

export const guides: BuyingGuide[] = [
  {
    slug: "choose-laptop-study-work",
    title: "How to Choose the Right Laptop for Study and Work",
    category: "Guide",
    summary: "Balance performance, portability, battery life, and price without paying for hardware you will not use.",
    imageTerms: ["laptop", "macbook"],
    relatedCategory: "laptop",
    sections: [
      { heading: "Decide your main use case", body: "Office work and studying need reliability, a comfortable screen, and good battery life. Programming benefits from more memory, while editing and gaming need stronger graphics performance." },
      { heading: "Choose CPU, RAM, and storage", body: "For everyday work, 8 GB RAM is the practical minimum. Choose 16 GB for programming or heavier multitasking. SSD storage makes the system feel much faster than a hard drive." },
      { heading: "Consider battery and weight", body: "A powerful laptop is less useful if it is too heavy to carry. Students and commuters should compare battery life, charger size, and total weight." },
      { heading: "Gaming laptop or ultrabook?", body: "Choose a gaming laptop for sustained graphics performance. Choose an ultrabook when portability, quiet operation, and battery life matter more." },
    ],
  },
  { slug: "best-phones-under-20m", title: "Best Phones Under 20M", category: "Guide", summary: "How to prioritize camera, battery, display, and long-term value under 20 million VND.", imageTerms: ["phone", "iphone"], relatedCategory: "phone", sections: [{ heading: "Start with priorities", body: "Choose two priorities such as camera and battery instead of looking for a phone that claims to be best at everything." }, { heading: "Check long-term value", body: "Software support, storage, repair access, and battery health can matter more than one headline specification." }] },
  { slug: "laptop-buying-guide", title: "Laptop Buying Guide", category: "Guide", summary: "A practical checklist for choosing performance, size, memory, and storage.", imageTerms: ["laptop"], relatedCategory: "laptop", sections: [{ heading: "Match the laptop to the workload", body: "List the applications you use most and choose hardware for those tasks." }, { heading: "Avoid unnecessary upgrades", body: "Spend on memory, storage, battery, and display quality before premium features you may not use." }] },
  { slug: "tablet-vs-laptop", title: "Tablet vs Laptop", category: "Review", summary: "Understand which form factor is better for work, study, travel, and entertainment.", imageTerms: ["tablet", "ipad"], relatedCategory: "tablet", sections: [{ heading: "Choose a tablet for flexibility", body: "Tablets are excellent for reading, notes, media, and light portable work." }, { heading: "Choose a laptop for full workflows", body: "A laptop remains better for desktop software, file management, programming, and long typing sessions." }] },
  { slug: "pick-headphones", title: "How to Pick Headphones", category: "Tips", summary: "Compare comfort, isolation, battery, microphone quality, and sound.", imageTerms: ["headphone", "airpods"], relatedCategory: "audio", sections: [{ heading: "Comfort comes first", body: "A great-sounding headset is a poor choice if the fit becomes uncomfortable after an hour." }, { heading: "Match features to your environment", body: "Noise cancellation helps during travel, while microphone quality matters more for calls and classes." }] },
  { slug: "keyboard-buying-basics", title: "Keyboard Buying Basics", category: "Guide", summary: "Understand layout, switches, connectivity, and ergonomics.", imageTerms: ["keyboard"], relatedCategory: "keyboard", sections: [{ heading: "Pick the right layout", body: "Compact layouts save desk space, while full-size keyboards retain a number pad." }, { heading: "Choose switches by feel and noise", body: "Linear switches feel smooth, tactile switches provide feedback, and clicky switches are usually louder." }] },
  { slug: "best-wireless-earbuds", title: "Best Wireless Earbuds", category: "Review", summary: "Choose earbuds for music, calls, exercise, and everyday use.", imageTerms: ["airpods", "earbud"], relatedCategory: "audio", sections: [{ heading: "Fit affects everything", body: "A secure seal improves bass, isolation, and microphone consistency." }, { heading: "Check real battery needs", body: "Compare earbud runtime and charging-case capacity with your normal daily routine." }] },
  { slug: "how-much-ram", title: "How Much RAM Do You Need?", category: "Tips", summary: "Choose enough memory for browsing, office work, coding, gaming, or editing.", imageTerms: ["laptop"], relatedCategory: "laptop", sections: [{ heading: "8 GB for basic use", body: "Eight gigabytes can handle ordinary browsing and office work, but leaves less room for heavy multitasking." }, { heading: "16 GB for comfortable multitasking", body: "Sixteen gigabytes is the safer choice for programming, gaming, and longer ownership." }] },
  { slug: "choose-phone-camera", title: "How to Choose a Phone Camera", category: "Tips", summary: "Look beyond megapixels and compare stabilization, lenses, software, and low-light results.", imageTerms: ["phone", "iphone"], relatedCategory: "phone", sections: [{ heading: "Megapixels are not the whole camera", body: "Sensor size, lens quality, stabilization, and image processing strongly affect results." }, { heading: "Choose lenses you will use", body: "A good main camera and useful telephoto lens may matter more than several weak secondary cameras." }] },
];

export const findGuide = (slug: string) => guides.find((guide) => guide.slug === slug);

export const guideTranslationsVi: Record<string, Pick<BuyingGuide, "title" | "category" | "summary" | "sections">> = {
  "choose-laptop-study-work": { title: "Cách chọn laptop phù hợp cho học tập và công việc", category: "Guide", summary: "Cân bằng hiệu năng, tính di động, thời lượng pin và giá mà không trả tiền cho phần cứng không cần thiết.", sections: [
    { heading: "Xác định nhu cầu chính", body: "Học tập và văn phòng cần độ ổn định, màn hình thoải mái và pin tốt. Lập trình cần nhiều RAM hơn, còn chỉnh sửa và chơi game cần đồ họa mạnh." },
    { heading: "Chọn CPU, RAM và bộ nhớ", body: "8 GB RAM là mức tối thiểu thực tế cho nhu cầu cơ bản. Chọn 16 GB cho lập trình hoặc đa nhiệm nặng. SSD giúp máy phản hồi nhanh hơn nhiều." },
    { heading: "Cân nhắc pin và trọng lượng", body: "Một chiếc laptop mạnh sẽ kém hữu ích nếu quá nặng. Sinh viên và người thường xuyên di chuyển nên so sánh pin, bộ sạc và tổng trọng lượng." },
    { heading: "Laptop gaming hay ultrabook?", body: "Chọn laptop gaming khi cần hiệu năng đồ họa duy trì. Chọn ultrabook khi ưu tiên gọn nhẹ, yên tĩnh và pin lâu." },
  ] },
  "best-phones-under-20m": { title: "Điện thoại tốt dưới 20 triệu", category: "Guide", summary: "Cách ưu tiên camera, pin, màn hình và giá trị sử dụng lâu dài trong ngân sách 20 triệu.", sections: [{ heading: "Bắt đầu từ ưu tiên", body: "Hãy chọn hai ưu tiên như camera và pin thay vì tìm một điện thoại được quảng cáo là tốt nhất mọi mặt." }, { heading: "Kiểm tra giá trị lâu dài", body: "Hỗ trợ phần mềm, bộ nhớ, khả năng sửa chữa và độ bền pin có thể quan trọng hơn một thông số nổi bật." }] },
  "laptop-buying-guide": { title: "Hướng dẫn mua laptop", category: "Guide", summary: "Danh sách thực tế để chọn hiệu năng, kích thước, RAM và bộ nhớ.", sections: [{ heading: "Chọn theo khối lượng công việc", body: "Liệt kê các ứng dụng bạn dùng nhiều nhất và chọn phần cứng phù hợp với những tác vụ đó." }, { heading: "Tránh nâng cấp không cần thiết", body: "Ưu tiên RAM, bộ nhớ, pin và chất lượng màn hình trước các tính năng cao cấp ít sử dụng." }] },
  "tablet-vs-laptop": { title: "Máy tính bảng hay laptop", category: "Review", summary: "Hiểu loại thiết bị phù hợp hơn cho công việc, học tập, di chuyển và giải trí.", sections: [{ heading: "Chọn máy tính bảng vì sự linh hoạt", body: "Máy tính bảng phù hợp để đọc, ghi chú, xem nội dung và xử lý công việc nhẹ khi di chuyển." }, { heading: "Chọn laptop cho quy trình đầy đủ", body: "Laptop phù hợp hơn cho phần mềm máy tính, quản lý tệp, lập trình và nhập liệu dài." }] },
  "pick-headphones": { title: "Cách chọn tai nghe", category: "Tips", summary: "So sánh độ thoải mái, chống ồn, pin, microphone và chất âm.", sections: [{ heading: "Ưu tiên độ thoải mái", body: "Tai nghe hay vẫn là lựa chọn kém nếu gây khó chịu sau một giờ sử dụng." }, { heading: "Chọn tính năng theo môi trường", body: "Chống ồn hữu ích khi di chuyển, còn chất lượng microphone quan trọng hơn cho cuộc gọi và lớp học." }] },
  "keyboard-buying-basics": { title: "Kiến thức cơ bản khi mua bàn phím", category: "Guide", summary: "Hiểu về bố cục, switch, kết nối và công thái học.", sections: [{ heading: "Chọn bố cục phù hợp", body: "Bố cục nhỏ gọn tiết kiệm diện tích, còn bàn phím full-size giữ lại cụm phím số." }, { heading: "Chọn switch theo cảm giác và độ ồn", body: "Switch linear mượt, tactile có phản hồi và clicky thường ồn hơn." }] },
  "best-wireless-earbuds": { title: "Tai nghe không dây đáng chọn", category: "Review", summary: "Chọn tai nghe cho âm nhạc, cuộc gọi, tập luyện và sử dụng hằng ngày.", sections: [{ heading: "Độ vừa vặn ảnh hưởng mọi thứ", body: "Độ kín tốt cải thiện âm trầm, cách âm và độ ổn định của microphone." }, { heading: "Kiểm tra nhu cầu pin thực tế", body: "So sánh thời lượng tai nghe và hộp sạc với thói quen sử dụng hằng ngày." }] },
  "how-much-ram": { title: "Bạn cần bao nhiêu RAM?", category: "Tips", summary: "Chọn đủ bộ nhớ cho duyệt web, văn phòng, lập trình, chơi game hoặc chỉnh sửa.", sections: [{ heading: "8 GB cho nhu cầu cơ bản", body: "8 GB đáp ứng duyệt web và văn phòng thông thường nhưng hạn chế khi đa nhiệm nặng." }, { heading: "16 GB cho đa nhiệm thoải mái", body: "16 GB là lựa chọn an toàn hơn cho lập trình, chơi game và sử dụng lâu dài." }] },
  "choose-phone-camera": { title: "Cách chọn camera điện thoại", category: "Tips", summary: "Không chỉ nhìn megapixel; hãy so sánh chống rung, ống kính, phần mềm và ảnh thiếu sáng.", sections: [{ heading: "Megapixel không quyết định tất cả", body: "Kích thước cảm biến, chất lượng ống kính, chống rung và xử lý ảnh ảnh hưởng lớn đến kết quả." }, { heading: "Chọn ống kính bạn thực sự dùng", body: "Camera chính tốt và ống tele hữu ích thường giá trị hơn nhiều camera phụ chất lượng thấp." }] },
};
