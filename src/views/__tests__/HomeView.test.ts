import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import HomeView from '../HomeView.vue'

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()

  class WebGLRendererMock {
    dispose = vi.fn()
    render = vi.fn()
    setPixelRatio = vi.fn()
    setSize = vi.fn()
    shadowMap = {
      enabled: false,
    }
  }

  return {
    ...actual,
    WebGLRenderer: WebGLRendererMock,
  }
})

describe('home view', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a canvas for the phase 1 three.js scene', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.find('[data-testid="three-canvas"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Three.js Phase 1')
    expect(wrapper.text()).toContain('Floating Cube With Three Lights')
  })

  it('cleans up the resize listener when the scene unmounts', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener')
    const removeEventListener = vi.spyOn(window, 'removeEventListener')

    const wrapper = mount(HomeView)
    const resizeListener = addEventListener.mock.calls.find(([eventName]) => eventName === 'resize')?.[1]

    wrapper.unmount()

    expect(resizeListener).toBeTypeOf('function')
    expect(removeEventListener).toHaveBeenCalledWith('resize', resizeListener)
  })
})
