import React from "react";
import { Link } from "react-router-dom";
import { SearchX, ArrowLeft, House } from "lucide-react";
import "./NotFound.css";

const NotFound: React.FC = () => {
  return (
    <div className="status-page status-page-notfound">
      <div className="status-card">
        <div className="status-icon-wrap">
          <div className="status-icon">
            <SearchX size={34} />
          </div>
        </div>

        <div className="status-code">404</div>

        <h1 className="status-title">Page Not Found</h1>

        <p className="status-description">
          The page you are looking for does not exist or may have been moved.
          Please check the link and try again.
        </p>

        <div className="status-actions">
          <Link to="/home" className="status-btn status-btn-primary">
            <House size={18} />
            <span>Go to Home</span>
          </Link>

          <button
            type="button"
            className="status-btn status-btn-secondary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;