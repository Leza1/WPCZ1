# 🚀 WPCZ1
WPCZ1 (Water Pump Controller Zigbee 1) là bản mod sử dụng các công tắc Zigbee có sẵn trên thị trường để điều khiển bơm nước (dùng phao điện) trong các hộ gia đình tại Việt Nam.

Phiên bản đầu tiên này hỗ trợ các công tắc Aqara QBKG11LM và QBKG12LM.

## ✨ Tính năng
- Giữ nguyên khả năng điều khiển bơm bằng phao điện như truyền thống.
- Hỗ trợ điều khiển từ xa thông qua các ứng dụng nhà thông minh.
- Hiển thị các thông số như công suất, điện áp, dòng điện, số lần bật/tắt,... giúp dễ dàng giám sát hoạt động của bơm và phát hiện các bất thường (quá tải, quá nhiệt, rò rỉ nước gây bật/tắt liên tục,...).
- Tích hợp chức năng bảo vệ quá nhiệt (trên 55°C) và quá tải (trên 2000W).
- Điều khiển đóng/ngắt bơm tại điểm điện áp gần 0V nhằm giảm hiện tượng tia lửa điện, giúp tăng tuổi thọ cho rơ le.

## 📸 Ảnh chụp màn hình
![Screenshot](./images/screenshot1.png)

## ⚙️ Hướng dẫn
### 🛠 Thay đổi phần cứng
⚠️ **Cảnh báo an toàn**
- ⚠️ Phần thao tác này **chỉ nên được thực hiện bởi người có chuyên môn về điện hoặc điện tử**. Việc lắp đặt hoặc sửa đổi sai cách có thể gây **nguy hiểm đến tính mạng**, cũng như **gây cháy nổ thiết bị.**
- ⚠️ **Không nên tự thực hiện nếu bạn không có chuyên môn** - hãy **nhờ kỹ thuật viên chuyên nghiệp** hoặc **sử dụng thiết bị đã được mod sẵn** để đảm bảo an toàn.

Aqara QBKG11LM và QBKG12LM sử dụng chung phần cứng với mã LM15-LNS-PA-A-T0.
- QBKG11LM: Có một nút nhấn điều khiển một ngõ ra rơ le.
- QBKG12LM: Được hàn thêm linh kiện để mở rộng thành hai nút nhấn, điều khiển hai ngõ ra rơ le.

WPCZ1 sử dụng **nút nhấn bên trái** để kết nối với **phao điện**, và **nút nhấn bên phải** để **bật/tắt bơm thủ công tại chỗ**.
- QBKG11LM:
  - Cần **hàn thêm điện trở 4K7 (SMD 0402)** và **tụ điện 100nF (SMD 0402).**
  - Hàn **dây kết nối phao điện** vào **nút nhấn bên trái.**
  - Xem hướng dẫn chi tiết tại [todo: liên kết].
  ![QBKG11LM](./images/QBKG11LM_modify.png)
- QBKG12LM:
  - **Tháo bỏ nút nhấn bên trái** để dùng cho phao điện.
  - Nên **thay điện trở có sẵn (100K SMD 0402)** bằng **4K7 (SMD 0402)** nhằm tăng độ nhạy cho phao điện đặt xa.
  - Hàn **dây kết nối phao điện** vào **nút nhấn bên trái.**
