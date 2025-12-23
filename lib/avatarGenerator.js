// lib/avatarGenerator.js
const crypto = require('crypto');

/**
 * Tạo avatar ngẫu nhiên cho người dùng khi đăng ký
 * Sử dụng nhiều API khác nhau để đảm bảo luôn có avatar
 * @param {string} name - Tên người dùng
 * @param {string} email - Email người dùng
 * @param {number} userId - ID người dùng
 * @returns {string} URL của avatar
 */
function generateRandomAvatar(name, email, userId) {
  // Tạo seed CỐ ĐỊNH dựa trên email và userId để avatar luôn giống nhau cho cùng một user
  // Không dùng timestamp hay random để đảm bảo avatar ổn định
  const seed = `${email || 'user'}-${userId || Date.now()}`;
  
  // Chọn style avatar dựa trên hash của seed để mỗi user có style cố định
  const avatarStyles = [
    'adventurer',      // Phong cách phiêu lưu
    'adventurer-neutral', // Phong cách trung tính
    'avataaars',       // Cartoon style
    'big-ears',        // Tai to dễ thương
    'big-ears-neutral', // Tai to trung tính
    'big-smile',       // Nụ cười rạng rỡ
    'bottts',          // Robot style
    'croodles',        // Phong cách vẽ tay
    'croodles-neutral', // Vẽ tay trung tính
    'fun-emoji',       // Emoji vui nhộn
    'micah',           // Style Micah
    'miniavs',         // Avatar mini
    'open-peeps',      // Open Peeps style
    'personas',        // Personas style
    'pixel-art',       // Pixel Art retro
    'pixel-art-neutral', // Pixel Art trung tính
  ];

  // Chọn style dựa trên hash của seed để style cố định cho mỗi user
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const styleIndex = Math.abs(hash) % avatarStyles.length;
  const selectedStyle = avatarStyles[styleIndex];
  
  // Encode seed để an toàn trong URL
  const encodedSeed = encodeURIComponent(seed);
  
  // DiceBear API - Miễn phí, không giới hạn, SVG chất lượng cao
  // Seed cố định đảm bảo avatar luôn giống nhau cho cùng một user
  const dicebearUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodedSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  
  return dicebearUrl;
}

/**
 * Tạo avatar từ chữ cái đầu của tên (backup option)
 * @param {string} name - Tên người dùng
 * @returns {string} URL của avatar
 */
function generateInitialsAvatar(name) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Chọn màu nền ngẫu nhiên
  const colors = [
    '3B82F6', // Blue
    '10B981', // Green
    'F59E0B', // Amber
    'EF4444', // Red
    '8B5CF6', // Purple
    'EC4899', // Pink
    '14B8A6', // Teal
    'F97316', // Orange
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // UI Avatars API
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${randomColor}&color=fff&size=200&bold=true&rounded=true`;
}

/**
 * Tạo avatar với nhiều tùy chọn fallback
 * Avatar sẽ CỐ ĐỊNH cho mỗi user (không thay đổi mỗi lần gọi)
 * @param {string} name - Tên người dùng
 * @param {string} email - Email người dùng  
 * @param {number} userId - ID người dùng (hoặc seed number)
 * @returns {string} URL của avatar
 */
function createUserAvatar(name, email, userId) {
  try {
    // Luôn sử dụng DiceBear với seed cố định để avatar không thay đổi
    // Seed dựa trên email + userId để đảm bảo mỗi user có avatar riêng biệt
    return generateRandomAvatar(name, email, userId);
  } catch (error) {
    console.error('❌ Error generating avatar:', error);
    // Fallback về initials avatar nếu có lỗi
    return generateInitialsAvatar(name);
  }
}

/**
 * Tạo nhiều avatar options để người dùng có thể chọn (optional feature)
 * @param {string} name - Tên người dùng
 * @param {string} email - Email người dùng
 * @param {number} count - Số lượng avatar cần tạo
 * @returns {Array<string>} Mảng các URL avatar
 */
function generateAvatarOptions(name, email, count = 5) {
  const avatars = [];
  // Sử dụng tất cả 16 styles để có nhiều variation hơn
  const styles = [
    'adventurer',
    'adventurer-neutral',
    'avataaars',
    'big-ears',
    'big-ears-neutral',
    'big-smile',
    'bottts',
    'croodles',
    'croodles-neutral',
    'fun-emoji',
    'micah',
    'miniavs',
    'open-peeps',
    'personas',
    'pixel-art',
    'pixel-art-neutral'
  ];
  
  // Thêm timestamp để mỗi lần load có avatar khác nhau
  const timestamp = Date.now();
  
  for (let i = 0; i < count; i++) {
    // Seed ngẫu nhiên với timestamp để mỗi lần khác nhau
    const randomSeed = `${email}-${timestamp}-${i}-${Math.random().toString(36).substring(7)}`;
    // Random style để có nhiều variation
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const url = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(randomSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    avatars.push(url);
  }
  
  return avatars;
}

module.exports = {
  generateRandomAvatar,
  generateInitialsAvatar,
  createUserAvatar,
  generateAvatarOptions,
};

