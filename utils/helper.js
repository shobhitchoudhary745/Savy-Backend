function getTwoMonthRanges(a, b) {
  const today = new Date();
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(today.getMonth() - b); //-2
  const previousMonth = new Date(today);
  previousMonth.setMonth(today.getMonth() - a); //-1

  const twoMonthsAgoStart = new Date(
    twoMonthsAgo.getFullYear(),
    Math.max(0, twoMonthsAgo.getMonth()),
    1
  );
  const twoMonthsAgoEnd = new Date(
    twoMonthsAgo.getFullYear(),
    Math.max(0, twoMonthsAgo.getMonth() + 1),
    0,
    23,
    59,
    999
  );
  const previousMonthStart = new Date(
    previousMonth.getFullYear(),
    Math.max(0, previousMonth.getMonth()),
    1
  );
  const previousMonthEnd = new Date(
    previousMonth.getFullYear(),
    Math.max(0, previousMonth.getMonth() + 1),
    0,
    23,
    59,
    999
  );

  return [
    [twoMonthsAgoStart, twoMonthsAgoEnd],
    [previousMonthStart, previousMonthEnd],
  ];
}

module.exports = {
  getTwoMonthRanges,
};
