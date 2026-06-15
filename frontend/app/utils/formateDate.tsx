const moment = require("moment/moment");

const formatDate = (date: Date | string): string => {
  if (date instanceof Date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[date.getMonth()];
  }
  return moment(date).format("DD/MM/YYYY");
};

export default formatDate;

export const sortByDate = <T,>(data: T[]): T[] => {
  return data.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};
