export default {
  id: 'placeholder', label: 'schematic',
  mount(host, params, ui) {
    const c = ui.canvas({ aspect: 16 / 7, minHeight: 200 });
    c.onResize(({ ctx, w, h }) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fg-faint');
      ctx.font = '14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(params?.message || 'Scene not available', w / 2, h / 2);
    });
    return { destroy() {} };
  },
};
