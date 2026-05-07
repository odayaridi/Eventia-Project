import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, House } from "lucide-react";
import "./Forbidden.css";

const Forbidden: React.FC = () => {
  return (
    <div className="status-page status-page-forbidden">
      <div className="status-card">
        <div className="status-icon-wrap">
          <div className="status-icon forbidden-icon">
            <ShieldAlert size={34} />
          </div>
        </div>

        <div className="status-code forbidden-code">403</div>

        <h1 className="status-title">Access Forbidden</h1>

        <p className="status-description">
          You do not have permission to access this page. If you reached this
          page by changing the link manually, please return to an allowed area
          of your account.
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

export default Forbidden;