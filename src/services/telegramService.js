/**
 * Gửi yêu cầu đến backend để thông báo cho admin về lệnh nạp tiền.
 * Backend sẽ chịu trách nhiệm gửi tin nhắn Telegram.
 *
 * @param {string | number} userId - ID của người dùng tạo lệnh nạp.
 * @param {string | number} amount - Số tiền nạp.
 * @param {string} memo - Nội dung memo.
 * @returns {Promise<void>}
 */
export const notifyAdminOfDeposit = async (userId, amount, memo) => {
  // URL này là endpoint trên backend Python của anh, anh có thể tùy chỉnh lại.
  const NOTIFY_API_URL = 'http://localhost:8000/api/notify-deposit-request';

  // Dữ liệu gửi lên server
  const payload = {
    user_id: userId,
    amount: amount,
    memo: memo,
  };

  try {
    const response = await fetch(NOTIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to send notification.');
    }

    console.log('Successfully requested deposit notification for user:', userId);

  } catch (error) {
    console.error('Error sending deposit notification request:', error);
    // Có thể thêm logic xử lý lỗi ở đây, ví dụ hiển thị thông báo cho người dùng.
  }
};