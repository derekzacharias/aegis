import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  useColorModeValue
} from '@chakra-ui/react';

export interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  onNavigate?: (href: string) => void;
}

const Breadcrumbs = ({ items, onNavigate }: BreadcrumbProps) => {
  if (!items.length) {
    return null;
  }

  const crumbColor = useColorModeValue('gray.500', 'gray.400');
  const currentColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Breadcrumb fontSize="sm" color={crumbColor} separator={<BreadcrumbSeparator />}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <BreadcrumbItem key={`${item.label}-${index}`} isCurrentPage={isLast}>
            {item.href && !isLast ? (
              <BreadcrumbLink onClick={() => onNavigate?.(item.href!)} fontWeight="medium">
                {item.label}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink
                as="span"
                cursor="default"
                fontWeight={isLast ? 'semibold' : 'medium'}
                color={isLast ? currentColor : crumbColor}
              >
                {item.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
