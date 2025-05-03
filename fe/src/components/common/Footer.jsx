import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-sm">&copy; {currentYear} Hệ thống Quản lý Kho Giày. Đã đăng ký Bản quyền.</p>
          </div>
          <div className="mt-2 md:mt-0">
            <p className="text-sm">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;