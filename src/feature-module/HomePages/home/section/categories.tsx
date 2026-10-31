import React from 'react'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../../core/common/imageWithBasePath'
import Slider from 'react-slick';
import { all_routes } from '../../../router/all_routes';

const Categories = () => {

    const categoriesslider = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 3500,
        pauseOnHover: true,
        responsive: [
          {
            breakpoint: 1200,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
              infinite: true,
              dots: true,
            },
          },
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
            },
          },
          {
            breakpoint: 576,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
        ],
    };

    const route = all_routes;

    const categoriesData = [
        {
            title: "Angular",
            instructors: "50 Instructors",
            icon: "assets/img/icon/framework-01.svg",
            alt: "Angular Category",
        },
        {
            title: "React JS",
            instructors: "65 Instructors",
            icon: "assets/img/icon/framework-02.svg",
            alt: "React JS Category",
        },
        {
            title: "Node JS",
            instructors: "42 Instructors",
            icon: "assets/img/icon/framework-03.svg",
            alt: "Node JS Category",
        },
        {
            title: "Docker & Cloud",
            instructors: "38 Instructors",
            icon: "assets/img/icon/framework-04.svg",
            alt: "Docker & Cloud Category",
        },
        {
            title: "Python & Data Science",
            instructors: "55 Instructors",
            icon: "assets/img/icon/career-01.svg",
            alt: "Python & Data Science Category",
        },
        {
            title: "Web Development",
            instructors: "48 Instructors",
            icon: "assets/img/icon/career-03.svg",
            alt: "Web Development Category",
        },
    ];

    return (
        <>
            {/* Course Categories */}
            <section className="course-section-five">
                <div className="container">
                    <div className="header-five-title text-center" data-aos="fade-down">
                        <h2>Course Categories</h2>
                        <p>
                            Explore our top categories to find the perfect courses for your
                            learning journey
                        </p>
                    </div>
                    <Slider {...categoriesslider}>
                        {categoriesData.map((item, index) => (
                            <div key={index} className="categories-item categories-item-six">
                                <div className="categories-icon">
                                    <div className="icon-bg">
                                        <Link to={route.courseCategory}>
                                            <ImageWithBasePath src={item.icon} alt={item.alt} />
                                        </Link>
                                    </div>
                                </div>
                                <h3 className="title">
                                    <Link to={route.courseCategory}>{item.title}</Link>
                                </h3>
                                <p>{item.instructors}</p>
                                <Link to={route.courseCategory} className="view-icon" aria-label={`View ${item.title}`}>
                                    <i className="fas fa-chevron-right" />
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>
        </>
    )
}

export default Categories
