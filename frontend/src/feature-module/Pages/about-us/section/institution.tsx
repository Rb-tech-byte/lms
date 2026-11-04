import React, { useEffect } from 'react';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import Slider from 'react-slick';
import { courseService } from '../../../../core/api/courseService';

const Institution: React.FC = () => {
  useEffect(() => {
    courseService.getRestV2OpenApiInfo().catch(() => null);
  }, []);

  const institutionslider = {
    lazyLoad: 'ondemand' as const,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    speed: 3000,
    autoplaySpeed: 1800,
    arrows: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 5 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 576, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <section className="client-section">
      <div className="container">
        <h6 className="fw-medium text-center mb-4">
          Accredited &amp; Partnered with Leading National and International Bodies
        </h6>
        <Slider {...institutionslider} className="institutions-slider lazy slider">
          {['01', '02', '03', '04', '05', '06', '07'].map((num) => (
            <div className="institutions-items p-1" key={num}>
              <ImageWithBasePath
                className="img-fluid"
                src={`./assets/img/client/${num}.svg`}
                alt="Partner Institution"
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Institution;
