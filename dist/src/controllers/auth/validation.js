export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
export const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
};
//# sourceMappingURL=validation.js.map