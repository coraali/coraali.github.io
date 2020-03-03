// ***** Component ***** //
class Video extends React.Component {
    render() {
        return (
            <li className="px-2">
                <a href={`https://www.youtube.com/watch?v=${this.props.videoId}`} target="_blank">
                    <figure>
                        <img className="objfit_cover" src={this.props.videoSnippet.thumbnails.high.url} alt=""/>
                    </figure>
                    <p className="videoTitle">{this.props.videoSnippet.title}</p>
                </a>
            </li>
        )
    }
}

class VideoBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({
            newData: this.props.searchData
        })
    }
    static getDerivedStateFromProps(nextProps,prevState) {
        prevState.newData = nextProps.searchData;
            return prevState;
    }
    render() {
        // console.log("我執行videoblock");
        // console.log(this.state.newData)
        let video = this.state.newData.map((item,index)=>{
            return <Video key={index} videoId={item.id.videoId} videoSnippet={item.snippet}/>
        });
        return (
            <ul className="list-unstyled videoBlock d-flex flex-wrap">
                {/*回傳放完資料的video變數*/}
                {video}
            </ul>
        )
    }
}

class SearchBlock extends React.Component {
    render() {
        return (
            <div className="searchBar d-flex my-3">
                <input className="px-1" type="text"  value={this.props.searchKeyword} onChange={this.props.searchVideo} />
                <i className="fas fa-search " onClick={this.props.clickSearch}></i>
            </div>
        )
    }
}

// 頁碼
class PageButton extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            num: 0,
            pagenum: this.props.current
        }
    }
    goToPage(clickNum,event) {
        this.setState({
            num: this.props.pageSize*(clickNum-1),
            pagenum: clickNum
        },function () {
            console.log(this.state);
            this.props.pageNext(this.state.num);
        })
    }
    render() {
        let arrPage = [];
        for( let i=1 ; i <= this.props.totalPage ; i++) {
            // numPage.push(<span key={i}  onClick={ this.goToPage() }>{i}</span>)
            arrPage.push(i);
        }
        let numPage = arrPage.map((num,index) => <span className={num === this.state.pagenum ? "active" : null} key={index} value={num} onClick={this.goToPage.bind(this,num)}>{num}</span>);
        return (
            <div className="changePage text-center">
                {numPage}
            </div>
        )
    }
}

const apiKey = "AIzaSyAEoDCSlAEPsKLIUMp5dIZz0c8CcG-oeA0";

class YoutubeForm extends React.Component {
    constructor(props) {
        super(props);
        // 新增狀態判斷，以及儲存輸入值
        this.state = ({
            isLoading: true, // fetch的載入狀態
            error: null, // fetch的錯誤狀態
            searchKeyword: '', // 使用者正在輸入的keyword
            clickKeyword: '', // 使用者送出的keyword
            searchData: [], // 搜尋到的總數據
            indexList:[], // 當前render的數據
            current: 1, // 當前頁碼
            pageSize:10, // 每頁顯示的影片數量
            goValue:0,  // 要去的第幾個影片
            totalPage:0 // 總頁數
        });
        // 使用者觸發事件，將this綁在該事件觸發dom上
        this.searchVideo = this.searchVideo.bind(this);
        this.clickSearch = this.clickSearch.bind(this);
        this.pageNext = this.pageNext.bind(this);
        this.setPage = this.setPage.bind(this);
    }
    // 更新使用者輸入的值到state中
    searchVideo(event) {
        this.setState({searchKeyword: event.target.value})
    }
    clickSearch(event) {
        this.setState({clickKeyword: this.state.searchKeyword});
        // console.log(this.state.searchKeyword);

        var url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&q=${this.state.searchKeyword}&type=video&maxResults=30`;
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoading: false,
                        searchData: result.items,
                        totalPage: Math.ceil( result.items.length / this.state.pageSize)
                    });
                    this.pageNext(this.state.goValue)
                },
                (error) => {
                    this.setState({
                        isLoading: false,
                        error: error
                    });
                }
            )
    }
    componentDidMount() {
        console.log("完成載入!");
    }
    // 設置該頁數內容
    setPage(num){
        this.setState({
            indexList: this.state.searchData.slice(num,num+this.state.pageSize)
        })
    }
    pageNext (num) {
        this.setPage(num)
    }

    render() {
        // console.log(this.props.searchData);
        // console.log(this.state.clickKeyword);
        return (
            <main>
                <h1 className="text-center">搜尋Youtube影片吧!</h1>
                {/* 把state中的searchVideo執行事件用props給SearchBlock中的input
                    clickSearch執行事件給i(搜尋紐)，searchKeyword給input的value*/}
                <SearchBlock searchVideo={this.searchVideo} searchKeyword={this.state.searchKeyword} clickSearch={this.clickSearch} />
                {/*傳入state的clickKeyword用來篩選影片*/}
                { this.state.searchData.length == 0 || this.state.clickKeyword == "" ? <div>上方搜尋關鍵字</div> : this.state.isLoading == true ? <div>Loading...</div> : <VideoBlock searchData={this.state.indexList} clickKeyword={this.state.clickKeyword} /> }
                { this.state.searchData.length == 0 || this.state.clickKeyword == "" ? <div></div> : <PageButton pageNext={this.pageNext} {...this.state}/> }

            </main>
        )
    }
}

ReactDOM.render(<YoutubeForm/>, document.getElementById('root'));