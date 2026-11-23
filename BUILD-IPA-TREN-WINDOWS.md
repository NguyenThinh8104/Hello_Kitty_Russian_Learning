# Build Russian Kitty thành IPA khi chỉ dùng Windows

Quy trình: **Windows → GitHub Actions chạy macOS/Xcode → tải IPA về Windows → ký và cài lên iPad**. Bạn không cần tải Xcode lên MacBook. Biên dịch vẫn diễn ra trên máy Mac của GitHub; đổi đuôi ZIP thành IPA trên Windows không tạo ra ứng dụng iOS chạy được.

## Đã chuẩn bị sẵn

- `.github/workflows/ipad-ipa.yml`: nút chạy build thủ công, dùng runner `macos-15`, chọn Xcode 26 và Node.js 24.
- `scripts/build-ios-unsigned.sh`: cài thư viện iOS, build archive Release thật bằng `xcodebuild`, xác nhận tệp Mach-O có kiến trúc arm64 rồi mới tạo `Payload/RussianKitty.app` trong IPA.
- Dự án iOS có tên Russian Kitty, icon hồng, chuỗi xin quyền micro/nhận giọng và privacy manifest.
- Không cần mật khẩu Apple, chứng chỉ ký hay API key trong workflow. Kết quả **chưa ký** để bạn ký bằng tài khoản của mình trên Windows.

## Chạy từ Windows

1. Tạo repository **Private** trên GitHub, ví dụ `Russian-Kitty`, và thêm README để có nhánh `main`. Nếu làm qua Codex, gửi link repo để tiếp tục đưa mã lên.
2. Nếu tự đưa mã lên: giải nén `Russian-Kitty-GitHub-Source.zip`, upload **nội dung bên trong** lên repo. Phải giữ cả thư mục `.github`; không upload nguyên file ZIP thay cho mã nguồn. Không đưa `node_modules`, `artifacts`, file khóa dịch vụ hay dữ liệu cá nhân lên repo.
3. Trong repo chọn **Actions > Russian Kitty - Build iPad IPA > Run workflow > Run workflow**. Nút này xuất hiện sau khi workflow nằm trên nhánh mặc định. Chỉ chạy khi bạn sẵn sàng dùng quota Actions của tài khoản; runner macOS có cách tính phút riêng, kiểm tra phần Billing/Actions nếu GitHub báo hết quota. Xem [hướng dẫn GitHub](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).
4. Chờ dấu tích xanh. Mở lần chạy đó, kéo xuống **Artifacts**, tải **Russian-Kitty-iPad-unsigned**. Giải nén artifact để lấy **Russian-Kitty-unsigned.ipa**. Nếu lỗi, xem bước đỏ hoặc tải artifact build log; có log mới xác định được lỗi build iOS thực tế.
5. IPA là app thật nhưng **chưa được ký**, chưa thể chạm file để cài ngay trên iPad. Dùng bước ký/cài bên dưới.

Nếu chỉ muốn cập nhật bài học/giao diện, sửa mã rồi chạy workflow lại. Workflow chỉ chạy thủ công, không tự chạy lặp gây tốn quota.

## Ký và cài bằng Windows

Một lựa chọn là **AltStore Classic + AltServer for Windows**, theo [hướng dẫn chính thức](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows). Tải phần mềm từ nguồn chính thức, nối iPad bằng USB và dùng Apple Account của chính bạn để ký/cài. Làm các bước xác thực tài khoản trên máy của bạn; không đưa mật khẩu/mã xác minh vào chat hay GitHub Secrets.

Sau khi cài AltStore Classic, chuyển IPA vào ứng dụng Files trên iPad; trong AltStore mở **My Apps > +** và chọn IPA để ký/cài. Làm theo hướng dẫn tương thích iPadOS hiện tại của AltStore, gồm Developer Mode nếu được yêu cầu. Đây là sideload bằng tài khoản cá nhân, không phải phát hành App Store. Với tài khoản miễn phí, app thường hết hạn sau 7 ngày và cần refresh; xem [tài liệu AltStore](https://faq.altstore.io/altstore-classic/your-altstore).

Không sửa cơ chế bảo vệ iPad hay dùng chứng chỉ doanh nghiệp không rõ chủ sở hữu. Workflow không tự cài AltServer hoặc đăng nhập tài khoản thay bạn.

## PDF giáo trình và bài học

Gói GitHub **không chứa PDF cá nhân**, nên có thể build mà không tải giáo trình lên dịch vụ bên ngoài. Tất cả 14 bài học bổ trợ vẫn có trong app. Sau khi cài lên iPad, chuyển PDF bạn có vào Files, vào **Cài đặt của Russian Kitty > Thêm PDF giáo trình từ Files** và chọn tệp (tối đa 60 MB). PDF lưu riêng trên iPad và mở bằng trình xem trong ứng dụng.

Bản nguồn dành cho Mac có thể kèm PDF cá nhân để build cục bộ; không dùng gói đó làm bản upload công khai.

## Tình trạng xác minh

Đã tạo dự án iOS và đồng bộ plugin; đã build bundle giao diện, chạy 30 kiểm thử tự động và mở bản Windows, phát giọng Google Translate, xem PDF. **Chưa có kết quả build iOS thành công trên GitHub cho đến khi workflow thực sự chạy.** Mã Swift/plugin và micro/PDF trên thiết bị thật cần được kiểm tra sau build; không coi việc tạo cấu trúc Payload hoặc đồng bộ Capacitor là đã xuất IPA thành công.

Sau khi có IPA, dùng checklist trong `CAI-IPAD-MAC-M1.md` để kiểm tra nghe, micro, ghi âm, bài viết, lưu tiến độ và sao lưu trên iPad thật. Bản Windows chạy trực tiếp tại `artifacts/native/win-unpacked/Russian Kitty.exe` hoặc từ ZIP Windows sau khi giải nén đủ file.
