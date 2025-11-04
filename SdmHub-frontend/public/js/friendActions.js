$(document).ready(() => {
  // Send Friend Request
  $('.send-request').on('click', function () {
    const receiverName = $(this).data('name');

    $.ajax({
      url: '/friends/sendRequest',
      method: 'POST',
      data: { receiverName },
      success: (res) => {
        alert(res.msg);
      },
      error: (err) => {
        alert(err.responseJSON?.msg || 'Error sending request');
      }
    });
  });

  // Accept Friend Request
  $('.accept-request').on('click', function () {
    const senderId = $(this).data('id');
    const senderName = $(this).data('name');

    $.ajax({
      url: '/friends/acceptRequest',
      method: 'POST',
      data: { senderId, senderName },
      success: (res) => alert(res.msg)
    });
  });

  // Cancel Request
  $('.cancel-request').on('click', function () {
    const senderId = $(this).data('id');

    $.ajax({
      url: '/friends/cancelRequest',
      method: 'POST',
      data: { senderId },
      success: (res) => alert(res.msg)
    });
  });
});
