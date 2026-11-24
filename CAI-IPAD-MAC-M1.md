# Cài Aymi Russian lên iPad từ MacBook M1

Xcode là bộ công cụ miễn phí của Apple để tạo và cài ứng dụng iPhone/iPad. Bạn chỉ cần dùng Xcode cho bước cài đặt; khi cài xong, mở Aymi Russian bằng biểu tượng trên iPad. Giao diện, bài tập và PDF nằm trong ứng dụng, không cần Safari hay máy chủ Windows.

## 1. Chuẩn bị trên Mac

1. Trong Finder, mở **Applications / Ứng dụng**, tìm **Xcode**. Nếu chưa có, mở **App Store**, tìm **Xcode** do Apple phát hành và cài bản chính thức phù hợp macOS. Dự án dùng Capacitor 8, cần Xcode 26 trở lên; MacBook M1 đáp ứng kiến trúc Apple silicon nhưng macOS cũng phải phù hợp phiên bản Xcode. Kiểm tra [bảng tương thích của Apple](https://developer.apple.com/xcode/system-requirements/).
2. Mở Xcode một lần, hoàn thành phần cài thành phần bổ sung. Cài **iOS platform support** nếu Xcode hỏi.
3. Cài **Node.js 24 LTS** từ [nodejs.org](https://nodejs.org/). Không cần cài .NET trên Mac để dùng bản iPad.
4. Cài **CocoaPods** theo [hướng dẫn chính thức](https://guides.cocoapods.org/using/getting-started.html). Nếu Mac đã có Homebrew, dùng `brew install cocoapods`. Script sẽ báo rõ nếu còn thiếu; không tự cài phần mềm hay yêu cầu mật khẩu hệ thống.

## 2. Chuyển mã nguồn sang Mac

Chép và giải nén **Aymi-Russian-iPad-Source.zip** trên Mac, chẳng hạn vào thư mục Documents. Giữ nguyên cấu trúc thư mục; PDF được giữ riêng trong `NgaNgo.Web/App_Data/2017-a1.pdf` và tự chép vào gói app khi build. Đây là bản PDF bạn cung cấp để sử dụng cá nhân.

Mở Terminal, gõ `cd ` (có dấu cách), kéo thư mục vừa giải nén vào Terminal rồi nhấn Enter. Chạy:

```bash
bash CHUAN-BI-IPAD.command
```

Script kiểm tra các công cụ, cài thư viện đúng phiên bản đã khóa, đóng gói bài học, chạy CocoaPods và mở dự án Xcode. Lần đầu cần Internet. Nếu thiếu Xcode/Node/CocoaPods, làm theo thông báo rồi chạy lại lệnh trên. Không cần xuất file IPA trước.

## 3. Cài lên iPad trong Xcode

1. Nối iPad với Mac bằng cáp USB, mở khóa iPad và chọn **Tin cậy / Trust** nếu được hỏi.
2. Trong Xcode, mở **Settings > Apple Accounts** (hoặc **Accounts**), thêm Apple Account của bạn. Không cần gửi mật khẩu hay mã xác minh cho người khác.
3. Nếu dự án chưa tự mở, mở **NgaNgo.App/ios/App/App.xcworkspace**. Chọn workspace sau khi script chạy xong; đừng chỉ mở file `.xcodeproj` vì các thư viện CocoaPods nằm trong workspace.
4. Chọn dự án **App** ở cột trái, chọn **TARGETS > App > Signing & Capabilities**. Bật **Automatically manage signing**, chọn **Team** của bạn (có thể là **Personal Team**). Nếu Bundle Identifier bị trùng, đổi thành một tên riêng, ví dụ `com.tenban.russiankitty`.
5. Ở thanh trên, chọn iPad của bạn làm thiết bị chạy thay vì **Any iOS Device**. Nhấn nút tam giác **Run ▶**. Chờ Xcode build và cài Aymi Russian.
6. Nếu iPad yêu cầu **Developer Mode**, làm theo [hướng dẫn của Apple](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device). Nếu được báo chưa tin cậy nhà phát triển, vào **Cài đặt > Cài đặt chung > VPN & Quản lý thiết bị** và tin cậy tài khoản chính bạn dùng để ký app.
7. Mở Aymi Russian. Khi luyện nói, cho phép **Micro** và **Nhận dạng giọng nói**. Thêm bàn phím Nga trong Cài đặt > Cài đặt chung > Bàn phím.

Apple cho phép thử app trên thiết bị cá nhân bằng Apple Account miễn phí. Personal Team có giới hạn và hồ sơ ký ngắn hạn, thường cần cài lại sau 7 ngày. Xem [quy định tài khoản của Apple](https://developer.apple.com/help/account/basics/about-your-developer-account/). TestFlight/App Store là bước phân phối riêng, chưa được thực hiện trong dự án này.

## 4. Kiểm tra sau khi cài

- Tắt Safari và không chạy máy chủ Windows; mở app, chọn bài, nhập đáp án và kiểm tra kết quả.
- Trong Cài đặt của app, thử giọng Google Translate; nghe lại và đổi tốc độ. Tải giọng cần Internet, âm thanh vừa nghe được giữ tạm trong phiên.
- Luyện nói: cấp quyền, đọc tiếng Nga, dừng, xem chữ nhận dạng; thử từ chối quyền để kiểm tra hướng dẫn lỗi. Nhận giọng là dịch vụ Apple, không phải Google Translate và không phải điểm phát âm.
- Thử ghi âm, dừng, nghe lại và chuyển bài để kiểm tra micro được đóng. Kiểm tra trên iPad thật vì Windows không chạy được thư viện iOS.
- Mở PDF trong app; đối chiếu số trang in của bài. Trình xem bản cài đặt mở toàn bộ tài liệu, không nhảy tự động đến trang bài học.
- Viết một câu có lỗi như `Я жыву в Москве.`, đồng ý gửi LanguageTool rồi kiểm tra. Bản nháp vẫn còn nếu mạng lỗi. Google chỉ nhận văn bản cần đọc; LanguageTool chỉ nhận bài viết khi bạn đồng ý.
- Xuất bản sao lưu vào Files, nhập lại; bản sao lưu từ phiên bản web vẫn dùng được. Tiến độ không tự đồng bộ giữa web và app.

## Những gì đã được kiểm tra và còn cần kiểm tra

Đã build gói giao diện, tạo và đồng bộ dự án iOS trên Windows. Đã chạy ứng dụng Windows và phát thành công MP3 Google Translate; kiểm thử tự động bao gồm đáp án, tiến độ, chia đoạn giọng đọc, lỗi nhà cung cấp, API/PDF và consent.

**Đã build archive bằng Xcode trên máy Mac của GitHub Actions và tải IPA chưa ký về Windows; chưa ký hoặc thử micro/PDF trên iPad thật.** Khi chuyển sang Mac, thực hiện các bước trên để xác nhận phần native thực tế. IPA chưa ký có sẵn tại `artifacts/ios/Aymi-Russian-unsigned.ipa`. Không có IPA đã ký.

Google Translate ở đây dùng luồng đọc của trang Translate (`translate_tts`), không phải Google Cloud TTS và không phải audio gốc của giáo trình. Đây là endpoint web không có cam kết API ổn định; app báo lỗi rõ nếu Google từ chối hoặc thay đổi endpoint, không âm thầm đổi sang giọng hệ điều hành.
