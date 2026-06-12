export class StatisticsMapper {
  private static monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  private static returnCompaniesByMonth = Array.from(
    { length: 12 },
    (_, index) => ({
      month: this.monthNames[index],
      count: 0,
    }),
  );

  static toChartList(CompanyByMonth: { createdAt }[]) {
    CompanyByMonth.forEach((company) => {
      const monthIndex = new Date(company.createdAt).getMonth();
      this.returnCompaniesByMonth[monthIndex].count++;
    });
    return this.returnCompaniesByMonth;
  }
}
