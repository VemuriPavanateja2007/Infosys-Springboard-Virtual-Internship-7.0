// ForecastinQ Core Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('wrapper').classList.toggle('toggled');
        });
    }

    // Auto-dismiss alert toasts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) bsAlert.close();
        }, 5000);
    });
});

// Helper for formatting currency values
function formatCurrency(amount, symbol = '$') {
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
}
