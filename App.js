import React from 'react';
import { App, RC, flux, Switch, Knob, Fader, Page } from './RC';

var state = flux({
  currentPage: '1-4',
  mode: 'white',
});

var actions = {
  togglePage() {
    state.currentPage = state.currentPage == '1-4' ? '5-8' : '1-4';
  },
  toggleMode() {
    state.mode = state.mode == 'black' ? 'white' : 'black';
  },
};

const ChannelStrip = (props) => (
  <RC {...props}>
    <Switch xy-0400 wh-1206 bg-white />
    <Switch xy-0407 wh-1206 bg-white />
    <Fader xy-0215 wh-1655 bg-b9fae4 />
    <Knob xy-0573 wh-1010 br-red0120 bg-white text="p" />
  </RC>
);

export default App(() => (
  <>
    <Page current={state.currentPage} name="1-4" backgroundColor={state.mode}>
      <ChannelStrip xy-0212 wh-2092 />
      <ChannelStrip xy-2412 wh-2092 />
      <ChannelStrip xy-4612 wh-2092 />
      <ChannelStrip xy-6812 wh-2092 />
    </Page>
    <Page current={state.currentPage} name="5-8" backgroundColor={state.mode}>
      <ChannelStrip xy-0212 wh-2092 />
      <ChannelStrip xy-2412 wh-2092 />
      <ChannelStrip xy-4612 wh-2092 />
      <ChannelStrip xy-6812 wh-2092 />
    </Page>
    <RC
      text={state.currentPage}
      xy-3601
      wh-2008
      br-black0100
      bg-white
      onClick={actions.togglePage}
    />
    <RC
      text={state.mode == 'white' ? 'dark' : 'light'}
      xy-1001
      wh-2008
      br-black0100
      bg-white
      onClick={actions.toggleMode}
    />
  </>
));
