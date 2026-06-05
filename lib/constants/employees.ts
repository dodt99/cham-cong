export type Employee = {
  id: string;
  fullName: string;
  taxCode: string;
};

export const EMPLOYEES: Employee[] = [
  { id: "24662", fullName: "Nguyễn Trà My", taxCode: "8712601809" },
  { id: "25120", fullName: "Phùng Thị Thu Dung", taxCode: "8643231618" },
  { id: "23380", fullName: "Trần Như Quỳnh", taxCode: "8459978969" },
  { id: "24643", fullName: "Nguyễn Phương Anh", taxCode: "8712601862" },
  { id: "24644", fullName: "Nguyễn Phương Anh", taxCode: "8643231625" },
  { id: "24676", fullName: "Trần Phương Linh", taxCode: "8571254148" },
  { id: "24666", fullName: "Trần Bích Hà", taxCode: "8712601799" },
  { id: "24675", fullName: "Đào Yến Linh", taxCode: "8614248279" },
  { id: "24678", fullName: "An Lâm Ngọc", taxCode: "8640818380" },
  { id: "24687", fullName: "Đào Thị Hải Yến", taxCode: "8532343355" },
  { id: "24665", fullName: "Lê Hồng Dương", taxCode: "8712601904" },
  { id: "23745", fullName: "Phạm Thị Thu Trang", taxCode: "8437660185" },
  { id: "30061", fullName: "Nguyễn Quỳnh Chi", taxCode: "8691036014" },
  { id: "29121", fullName: "Nguyễn Thị Linh", taxCode: "8615412450" },
  { id: "30070", fullName: "Phạm Thị Thu", taxCode: "8657412036" },
  { id: "24669", fullName: "Nguyễn Thị Hương", taxCode: "8682241088" },
  { id: "24677", fullName: "Phạm Cẩm Ly", taxCode: "8712601830" },
  { id: "23743", fullName: "Đào Thị Lan Anh", taxCode: "8323732196" },
  { id: "23750", fullName: "Vũ Thị Thanh Hồng", taxCode: "8511395440" },
  { id: "24667", fullName: "Nguyễn Thị Hòa", taxCode: "8023539184" },
  { id: "30062", fullName: "Hoàng Thị Vân Anh", taxCode: "8451794649" },
  { id: "24642", fullName: "Hoàng Phương Anh", taxCode: "871260781" },
  // { id: "24663", fullName: "Nguyễn Thị Minh Bình", taxCode: "8346737987" }, // Nghỉ
  { id: "30067", fullName: "Ngô Văn Sơn", taxCode: "8650673328" },
  { id: "24660", fullName: "Vũ Quốc Bảo", taxCode: "8672370334" },
  { id: "24679", fullName: "Nguyễn Thị Hồng Ngọc", taxCode: "8510675117" },
  // { id: "24683", fullName: "Phan Minh Tuấn", taxCode: "8514611749" }, // Nghỉ
  { id: "24680", fullName: "Đoàn Thị Nhung", taxCode: "8400971427" },
  { id: "19439", fullName: "Nguyễn Thị Bích Hằng", taxCode: "8097507243" },
  { id: "19433", fullName: "Đỗ Thị Ngọc Diệp", taxCode: "8480133731" },
  { id: "30063", fullName: "Nguyễn Thị Mai Trang", taxCode: "8718750395" },
  { id: "30066", fullName: "Vương Thị Ngọc Ánh", taxCode: "8614690529" },
  { id: "30064", fullName: "Đỗ Minh Khuê", taxCode: "8625569965" },
  { id: "30068", fullName: "Nguyễn Thị Minh Hòa", taxCode: "8571815717" },
  { id: "23160", fullName: "PHAN THỊ HỒNG THÚY", taxCode: "8009287175" },
];

export const EMPLOYEES_K2: Employee[] = [
  { id: "19435", fullName: "Ngô Thị Ánh Nguyệt", taxCode: "0105209369" },
  { id: "19441", fullName: "Nguyễn Thị Hoa", taxCode: "8338107607" },
  { id: "19440", fullName: "Nguyễn Thị Chuyên", taxCode: "8338107597" },
  { id: "19437", fullName: "Nguyễn Hải Quyên", taxCode: "8119343471" },
  { id: "19431", fullName: "Đặng Lan Phương", taxCode: "8480133805" },
  { id: "19434", fullName: "Lê Quang Trung", taxCode: "8429284755" },
  { id: "19169", fullName: "Đỗ Như Thành", taxCode: "8626680596" },
  { id: "23420", fullName: "Nguyễn Thị Thu Hồng", taxCode: "8115110652" },
  { id: "23741", fullName: "Vũ Quang Anh", taxCode: "8712601887" },
  { id: "24686", fullName: "Vũ Anh Văn", taxCode: "8124737947" },
  { id: "30065", fullName: "Hoàng Thị Thủy", taxCode: "8573268202" },
  { id: "30069", fullName: "Đặng Thị Thu Phương", taxCode: "8425272170" },
  { id: "19436", fullName: "Nguyễn Diệu Hoa", taxCode: "8331453125" },
  { id: "23746", fullName: "Nguyễn Ngọc Hoàng Yến", taxCode: "8439532809" },
  { id: "23744", fullName: "Trần Thị Hương", taxCode: "8556638559" },
];

export const EMPLOYEES_EVENING_AND_WEEKEND: Employee[] = [
  ...EMPLOYEES,
  ...EMPLOYEES_K2,
];
