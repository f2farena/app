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

  } catch (error) {
    console.error('Error sending deposit notification request:', error);
  }
};

export const requestWithdrawal = async (userId, amount, walletAddress) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notify-withdrawal-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId, amount: parseFloat(amount), wallet_address: walletAddress }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to send withdrawal request');
        }
        return await response.json();
    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        throw error;
    }
};