import { Icon, IconProps, useColorModeValue } from '@chakra-ui/react';

const AegisMark = (props: IconProps) => {
  const primary = useColorModeValue('#1a7cff', '#4796ff');
  const secondary = useColorModeValue('#0f4ec4', '#1a7cff');
  const highlight = useColorModeValue('#f5faff', '#e9f3ff');

  return (
    <Icon viewBox="0 0 64 64" role="img" aria-label="Aegis mark" {...props}>
      <path
        fill={primary}
        d="M32 4 8 12v16c0 15.86 9.8 30.16 24 35.6 14.2-5.44 24-19.74 24-35.6V12L32 4z"
      />
      <path
        fill={secondary}
        d="M32 12.4 48 18v9.44c0 11.29-6 21.63-16 26.65-10-5.02-16-15.36-16-26.65V18l16-5.6z"
      />
      <path
        fill={highlight}
        d="M32 18 42 42h-5.16l-1.98-4.64h-6.73L26.15 42H21L32 18zm-2.26 13.16h4.52L32 25l-2.26 6.16z"
      />
    </Icon>
  );
};

export default AegisMark;
