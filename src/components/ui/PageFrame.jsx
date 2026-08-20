import PageHeader from './PageHeader';

/** Marco común: ancho, espaciado y encabezado sin alterar la lógica del módulo. */
const PageFrame = ({
  title,
  description = null,
  actions = null,
  breadcrumb = null,
  icon = null,
  children,
  width = 'wide',
  className = ''
}) => {
  const widths = {
    narrow: 'max-w-3xl',
    normal: 'max-w-6xl',
    wide: 'max-w-[1600px]',
    full: 'max-w-none'
  };

  return (
    <section className={`mx-auto w-full ${widths[width] || widths.wide} ${className}`}>
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        breadcrumb={breadcrumb}
        icon={icon}
      />
      <div className="space-y-4 sm:space-y-5">{children}</div>
    </section>
  );
};

export default PageFrame;
