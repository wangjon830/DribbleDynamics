import '../shared/App.css';
import './Home.css';
import React from 'react';

function Home() {
  return (
    <div className="App-page Home-page">
      <div className='row'>
        <div className='col-2'/>
        <div className='col-6 header-main'>
          <p className='header-main-italic'>
            Welcome to
          </p>
          <p className='header-main-text'>
            Dribble <br /> Dynamics
          </p>
          <p className='header-main-subtext'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut laoreet sapien diam, in semper turpis fermentum at. 
            Ut pretium diam nec metus imperdiet, luctus iaculis mauris ullamcorper. Aenean feugiat sapien a ex ornare, 
            eu pretium felis molestie. Pellentesque ligula leo, luctus a nulla in, sollicitudin venenatis arcu. Vestibulum 
            a ornare felis, at euismod lorem. Sed semper vel massa non facilisis. Aenean eu cursus tortor, volutpat dignissim 
            odio. Nulla id sagittis enim. Aenean varius at nibh dapibus facilisis. Donec condimentum elit ante, id consectetur erat iaculis pretium. Fusce quis interdum nunc.
          </p>
        </div>
        <div className='col-2'/>
      </div>

    </div>
  );
}

export default Home;
