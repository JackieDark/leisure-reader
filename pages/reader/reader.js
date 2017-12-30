// pages/reader/reader.js
const api = require('../../utils/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,//请求到数据显示界面
    clientWidth: "",
    clientHeight: "",
    winHeight: "",//窗口高度
    scrollTop: 0,
    bookSources: [],
    bookChapters: {},
    indexPage: 0, //当前章节
    indexChapterContent: {}, //当前阅读的内容
    readerCss: {
      titleSize: 20,
      contentSize: 16,
      color: '#333', //夜间 #424952
      lineHeight: 60,
      backgroundColor: '#fff' //#C7EDCC 护眼色  #080C10 黑夜
    },
    showMenu: false,
    showChapter: false,
    isDark: false,
    isHuyan: false
  },

  toggleDark: function() {
    this.setData({
      isDark: !this.data.isDark
    });
    if (this.data.isDark) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#080C10'
      });
      this.data.readerCss.color = '#696969';
      this.data.readerCss.backgroundColor = '#080C10';
      this.setData({
        isHuyan: false,
        readerCss: this.data.readerCss
      });
    }else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#cb1c36'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#fff';
      this.setData({
        isHuyan: false,
        readerCss: this.data.readerCss
      });
    }
  },

  toggleHuyan: function () {
    this.setData({
      isHuyan: !this.data.isHuyan
    });
    if (this.data.isHuyan) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#C7EDCC';
      this.setData({
        isDark: false,
        readerCss: this.data.readerCss
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#cb1c36'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#fff';
      this.setData({
        isDark: false,
        readerCss: this.data.readerCss
      });
    }
  },

  incSize: function() {
    if (this.data.readerCss.titleSize === 30) {
      return
    }
    this.data.readerCss.titleSize = this.data.readerCss.titleSize + 5;
    this.data.readerCss.lineHeight = this.data.readerCss.lineHeight + 10;
    this.data.readerCss.contentSize = this.data.readerCss.contentSize + 5;
    this.setData({
      readerCss: this.data.readerCss
    });
  },

  decSize: function () {
    if (this.data.readerCss.titleSize === 20) {
      return
    }
    this.data.readerCss.titleSize = this.data.readerCss.titleSize - 5;
    this.data.readerCss.contentSize = this.data.readerCss.contentSize - 5;
    this.data.readerCss.lineHeight = this.data.readerCss.lineHeight - 10;
    this.setData({
      readerCss: this.data.readerCss
    });
  },

  getBookSources: function (book_id) {
    wx.request({
      url: api.book.bookSources(book_id),
      success: res => {
        this.setData({
          bookSources: res.data
        });
        this.getBookChapters(this.data.bookSources[1] ? this.data.bookSources[1]._id : this.data.bookSources[0]._id);
      }
    })
  },

  getBookChapters: function (source_id) {
    wx.request({
      url: api.book.bookChapters(source_id),
      success: res => {
        this.setData({
          bookChapters: res.data
        });
        this.getChapterContent(this.data.bookChapters.chapters[this.data.indexPage].link);
      }
    })
  },

  getChapterContent: function (link) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: api.book.chapterContent(link),
      success: res => {
        wx.hideLoading();
        this.setData({
          showPage: true,
          showChapter: false,  //关闭目录
          scrollTop: 0,
          indexChapterContent: res.data
        });
      }
    })
  },

  goPrev: function () {
    if (this.data.indexPage === 0) {
      wx.showToast({
        title: '已到第一章',
        icon: 'loading',
        mask: true
      });
    }
    this.setData({
      indexPage: this.data.indexPage - 1
    });
    if (this.data.bookChapters.chapters[this.data.indexPage]) {
      this.getChapterContent(this.data.bookChapters.chapters[this.data.indexPage].link);
    }
  },

  goNext: function () {
    if (this.data.indexPage === this.data.bookChapters.chapters.length - 1) {  //当前在最后一章
      wx.showToast({
        title: '已到最新章节',
        icon: 'loading',
        mask: true
      });
      return;
    }
    this.setData({
      indexPage: this.data.indexPage + 1
    });
    console.log(this.data.indexPage);
    if (this.data.bookChapters.chapters[this.data.indexPage]) {
      this.getChapterContent(this.data.bookChapters.chapters[this.data.indexPage].link);
    }
  },

  openMenu: function (event) {
    let xMid = this.data.clientWidth/2;
    let yMid = this.data.clientHeight/2;
    let x = event.detail.x;
    let y = event.detail.y;
    if ((x > xMid - 100 && x < xMid + 100) && (y<yMid+100&&y>yMid-100 )) {
      this.setData({
        showMenu: !this.data.showMenu
      });
    }
  },

  showChapter: function() {
    this.setData({
      showChapter: !this.data.showChapter
    });
  },

  pickChapter: function(event) {
    this.setData({
      indexPage: event.target.dataset.indexpage
    });
    this.getChapterContent(event.target.dataset.link);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.book_title,
    });
    wx.getSystemInfo({
      success: (res) => {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        this.setData({
          clientHeight: clientHeight,
          clientWidth: clientWidth,
          winHeight: calc
        });
      }
    });
    wx.showLoading({
      title: '中部呼出菜单',
      mask: true
    });
    setTimeout( () => {
      wx.hideLoading()
      this.getBookSources(options.book_id);
    }, 3000);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})