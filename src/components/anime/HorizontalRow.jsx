import React from 'react';
import { Link } from 'react-router-dom';
import Poster from './Poster';

const HorizontalRow = ({ title, items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="horizontal-row">
      <div className="horizontal-row__header">
        <h3>{title}</h3>
      </div>
      <div className="horizontal-row__scroll">
        {items.map((item) => {
          const isNavigable = Boolean(item.link && item.isNavigable);
          const Wrapper = isNavigable ? Link : 'div';
          const wrapperProps = isNavigable ? { to: item.link } : {};

          return (
            <article key={item.id} className={`horizontal-row__card${isNavigable ? '' : ' is-disabled'}`}>
              <Wrapper {...wrapperProps} className="horizontal-row__link">
                <div className="horizontal-row__media">
                  <Poster src={item.imageUrl} alt={item.title} className="poster--ratio" />
                </div>
                <div className="horizontal-row__body">
                  <h4 className="horizontal-row__title">{item.title}</h4>
                  {item.type && <span className="horizontal-row__badge">{item.type}</span>}
                </div>
              </Wrapper>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default HorizontalRow;
