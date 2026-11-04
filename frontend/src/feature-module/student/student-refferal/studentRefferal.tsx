import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import { useAuth } from '../../../core/auth/authContext';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const StudentRefferal: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    courseService.getPublicCatalog().then((res) => {
      setCourses(res.courses || []);
    });
  }, []);

  const referralUrl = `${window.location.origin}/register?ref=${user?.username || 'out_student'}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <Breadcrumb title="Peer Study Group & Bursary Referrals" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-2">Invite Fellow Learners to OUT Digital Programmes</h5>
                <p className="text-muted small mb-3">
                  Share your official Open University of Tanzania study link with colleagues across
                  our {courses.length} active academic programmes.
                </p>
                <div className="input-group">
                  <input type="text" className="form-control" value={referralUrl} readOnly />
                  <button type="button" onClick={copyLink} className="btn btn-primary">
                    {copied ? 'Copied!' : 'Copy Study Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentRefferal;
