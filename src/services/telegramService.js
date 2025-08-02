// telegramService.js
export const notifyAdminOfDeposit = async (userId, amount, memo) => {
  const NOTIFY_API_URL = 'https://f2farena.com/api/notify-deposit-request';

  const payload = {
    user_id: userId,
    amount: parseFloat(amount), // Đảm bảo amount là số
    memo: memo,
  };

  try {
    console.log('Sending deposit notification request to backend:', payload); // LOG CHI TIẾT
    const response = await fetch(NOTIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend responded with an error for deposit notification:', errorData); // LOG LỖI TỪ BACKEND
      throw new Error(errorData.detail || 'Failed to send notification to backend.');
    }

    console.log('Successfully requested deposit notification for user:', userId);
    // Có thể thêm thông báo thành công cho người dùng ở đây
    alert('Yêu cầu nạp tiền của bạn đã được gửi đến Admin. Vui lòng chờ xác nhận!');

  } catch (error) {
    console.error('Error sending deposit notification request:', error);
    alert('Đã có lỗi khi gửi yêu cầu nạp tiền. Vui lòng thử lại hoặc liên hệ hỗ trợ.'); // Thông báo lỗi cho người dùng
  }
};