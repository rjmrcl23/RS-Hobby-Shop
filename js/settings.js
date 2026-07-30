document.addEventListener("DOMContentLoaded", () => {
    const notifications = document.getElementById("privacyNotifications");
    const analytics = document.getElementById("privacyAnalytics");
    const backup = document.getElementById("privacyBackup");
    const theme = document.getElementById("settingsTheme");
    const defaultSort = document.getElementById("settingsDefaultSort");
    const saveButton = document.getElementById("saveSettings");
    const feedback = document.getElementById("settingsFeedback");

    const loadSettings = () => {
        const settings = getSettings();
        if (notifications) notifications.checked = settings.notifications !== false;
        if (analytics) analytics.checked = settings.analytics !== false;
        if (backup) backup.checked = settings.autoBackup === true;
        if (theme) theme.value = settings.theme || "Dark";
        if (defaultSort) defaultSort.value = settings.defaultSort || "Newest first";
    };

    saveButton?.addEventListener("click", () => {
        const settings = {
            notifications: notifications?.checked ?? true,
            analytics: analytics?.checked ?? true,
            autoBackup: backup?.checked ?? false,
            theme: theme?.value || "Dark",
            defaultSort: defaultSort?.value || "Newest first",
            updatedAt: Date.now()
        };
        saveSettings(settings);
        if (settings.autoBackup) {
            localStorage.setItem("rs_hobby_last_backup", JSON.stringify(getBackupData()));
        }
        feedback?.classList.remove("d-none");
        if (feedback) feedback.textContent = "Settings saved.";
    });

    loadSettings();
});
