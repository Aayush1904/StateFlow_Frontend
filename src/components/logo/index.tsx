import { Link } from "react-router-dom";

const Logo = (props: { url?: string; asLink?: boolean }) => {
  const { url = "/", asLink = true } = props;

  const logoContent = (
    <div className="flex h-6 w-6 items-center justify-center">
      <img
        src="/Logo.png"
        alt="Stateflow logo"
        className="h-6 w-6 object-contain"
      />
    </div>
  );

  return (
    <div className="flex items-center justify-center sm:justify-start">
      {asLink ? (
        <Link to={url}>
          {logoContent}
        </Link>
      ) : (
        logoContent
      )}
    </div>
  );
};

export default Logo;
