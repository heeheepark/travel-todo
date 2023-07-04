import React, { useEffect, useState } from 'react';
import { Cascader, Form, DatePicker, ColorPicker, Button } from 'antd';
import { TodoDiv } from '../styles/TodoStyle';
import axios from 'axios';
import { tempRegionData } from '../assets/tempData';
import { useNavigate } from 'react-router-dom';
import TodoList from '../components/todo/TodoList';
import TravelReview from '../components/todo/TravelReview';

// 저장 버튼

const Todo = ({ data, setData }) => {
  const visitList = data.visitList;
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;

  const [color, setColor] = useState('#1E88E5');
  const [regionData, setRegionData] = useState(null);
  const [region, setRegion] = useState([]);

  // 저장 버튼 클릭시
  const onFinish = fieldsValue => {
    console.log(fieldsValue);
    const rangeValue = fieldsValue['date-picker'];
    const colorValue =
      fieldsValue['color'] === '#1E88E5' ? '#1E88E5' : fieldsValue['color'].toHexString();
    const values = {
      ...fieldsValue,
      'date-picker': [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')],
      color: colorValue,
    };
    console.log('Received values of form: ', values);
    const postTitleData = {
      idRegion: values.city[0],
      idRegionDetail: values.city[1],
      startDate: values['date-picker'][0],
      endDate: values['date-picker'][1],
      calColor: values.color,
    };
    console.log(postTitleData);
  };

  // 취소 버튼 클릭시
  const handleCancel = () => {
    navigate(-1);
  };

  // 일정 추가 버튼 클릭시
  const handleAddVisitList = () => {
    console.log('클릭됨');
    const newVisitList = {
      id: Date.now(),
      title: '',
      complete: false,
      checkList: [],
    };
    const newVisitListData = [...data.visitList, newVisitList];

    const newData = { ...data, visitList: newVisitListData };
    console.log(newData);
    setData(newData);
  };

  // DB 데이터 불러오기
  useEffect(() => {
    const getRegion = async setRegionData => {
      try {
        const res = await axios.get('/api/todo');
        const result = res.data; // 백엔드 서버 있을 때만 작동
        // const result = tempRegionData;
        console.log(result);
        setRegionData(result);
      } catch (err) {
        console.log(err);
      }
    };
    getRegion(setRegionData);
  }, []);

  useEffect(() => {
    if (regionData) {
      // 지역 데이터 필터링
      const region = regionData.region;
      const regionDetail = regionData.regionDetail;
      const newRegion = region.map(item => ({
        value: item.idRegion,
        label: item.region,
      }));
      const newRegionData = newRegion.map((newRegionItem, index) => {
        const newregionDetail = regionDetail.filter(
          item => item.idRegion === region[index].idRegion
        );
        const newChildren = newregionDetail.map(item => {
          return { value: item.idRegionDetail, label: item.regionDetail };
        });
        return { ...newRegionItem, children: newChildren };
      });
      setRegion(newRegionData);
    }
  }, [regionData]);

  return (
    <TodoDiv>
      <Form
        name="time_related_controls"
        layout="horizontal"
        onFinish={onFinish}
        initialValues={{
          color: '#1E88E5',
          'visit-complete': false,
          // city: [11, 11110],
          // 'date-picker': ['2023-07-02', '2023-07-05'],
        }}
      >
        <h2>Travel Schedule</h2>
        <div className="travel-schedule-wrap">
          <div className="input-travel">
            <Form.Item
              name="city"
              rules={[
                {
                  required: true,
                  message: '여행 지역을 선택해주세요.',
                },
              ]}
            >
              <Cascader options={region} className="cascader" placeholder="여행 지역 선택" />
            </Form.Item>
            <Form.Item
              name="date-picker"
              rules={[
                {
                  type: 'array',
                  required: true,
                  message: '여행 기간을 선택해주세요.',
                },
              ]}
            >
              <RangePicker className="range-picker" placeholder={['시작일', '종료일']} />
            </Form.Item>
            <Form.Item name="color">
              <ColorPicker value={color} />
            </Form.Item>
          </div>
          <div className="add-travel-btn">
            <Button type="primary" htmlType="submit">
              저장
            </Button>
            <Button onClick={handleCancel}>취소</Button>
          </div>
        </div>
        <div className="detail-plan-wrap">
          <div className="travel-plan">
            <div>
              <h2>Travel Plan</h2>
              <ul className="todoList-wrap">
                {visitList.map((item, index) => (
                  <TodoList
                    key={index}
                    index={index}
                    visitList={item}
                    data={data}
                    setData={setData}
                  />
                ))}
                <li>
                  <Button
                    type="primary"
                    className="add-plan-btn"
                    style={{ background: '#1E88E5' }}
                    onClick={handleAddVisitList}
                  >
                    일정 추가
                  </Button>
                </li>
              </ul>
            </div>
          </div>
          <div className="travel-review">
            <h2>Travel Review</h2>
            <TravelReview />
          </div>
        </div>
      </Form>
    </TodoDiv>
  );
};

export default Todo;
