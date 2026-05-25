export type Employee = {
  id: string;
  fullName: string;
  taxCode: string;
};

export const EMPLOYEES: Employee[] = [
  {
    id: "NV001",
    fullName: "Nguyễn Văn An",
    taxCode: "0123456789",
  },
  {
    id: "NV002",
    fullName: "Trần Thị Bình",
    taxCode: "0987654321",
  },
  {
    id: "NV003",
    fullName: "Lê Minh Cường",
    taxCode: "0111222333",
  },
  {
    id: "NV004",
    fullName: "Phạm Thu Dung",
    taxCode: "0444555666",
  },
  {
    id: "NV005",
    fullName: "Hoàng Văn Em",
    taxCode: "0777888999",
  },
];
