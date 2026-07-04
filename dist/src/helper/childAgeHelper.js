export const calculateChildAge = (birthDate) => {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (today.getDate() < birthDate.getDate()) {
        months--;
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    const totalMonths = years * 12 + months;
    return {
        ageYear: years,
        ageMonth: totalMonths,
        ageText: `${years} tahun ${months} bulan`,
    };
};
//# sourceMappingURL=childAgeHelper.js.map