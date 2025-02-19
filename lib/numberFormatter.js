export const formatToDecimal = (value) => {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
  currency: "PHP",
  }).format(value);

  return formatted;
};

export const formatToReadableDate = (value) => {
  const date = new Date(value);

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formatter.format(date);
};
