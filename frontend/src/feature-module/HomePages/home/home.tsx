import React, { useEffect } from 'react';
import Footer from './footer';
import Banner from './section/banner';
import Categories from './section/categories';
import Counter from './section/counter';
import Featuredcourse from './section/featured-course';
import Masterskill from './section/master-skill';
import Experienced from './section/experienced';
import Knowledge from './section/knowledge';
import Testimonials from './section/testimonials';
import Latestblog from './section/latest-blog';
import { courseService } from '../../../core/api/courseService';

const Home: React.FC = () => {
  useEffect(() => {
    courseService.getRestV2OpenApiInfo().catch(() => null);
  }, []);

  return (
    <div style={{ background: '#f8fafc' }}>
      <Banner />
      <Counter />
      <Categories />
      <Featuredcourse />
      <Masterskill />
      <Knowledge />
      <Experienced />
      <Testimonials />
      <Latestblog />
      <Footer />
    </div>
  );
};

export default Home;
