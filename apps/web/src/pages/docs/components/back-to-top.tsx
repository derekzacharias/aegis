import { IconButton, useColorModeValue } from '@chakra-ui/react';
import { ArrowUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const hoverBg = useColorModeValue('brand.600', 'brand.400');

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 280);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <IconButton
      position="fixed"
      bottom={8}
      right={8}
      zIndex={20}
      aria-label="Back to top"
      icon={<ArrowUp size={18} />}
      borderRadius="full"
      shadow="lg"
      colorScheme="brand"
      _hover={{ bg: hoverBg }}
      onClick={handleScrollTop}
    />
  );
};

export default BackToTop;
