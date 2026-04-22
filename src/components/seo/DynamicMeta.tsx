// ============================================
// DynamicMeta - DISABLED for public routes
// Static meta is in index.html
// This component is only used by routes with HelmetProvider
// ============================================

interface DynamicMetaProps {
  page?: string;
}

const DynamicMeta = ({ page }: DynamicMetaProps) => {
  // For Index page (public route without HelmetProvider),
  // this component renders nothing.
  // SEO is handled by static meta in index.html
  return null;
};

export default DynamicMeta;
