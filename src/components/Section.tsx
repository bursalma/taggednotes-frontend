import { useEffect } from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';

import { useAppDispatch, useAppSelector } from '../redux/store';
import { sectionMounted, selectTagMetaBySection } from '../redux/tagSlice';
import TagArea from './TagArea';
import NoteArea from './NoteArea';

const Section: React.FC<{ sectionId: number }> = ({ sectionId }) => {
    const dispatch = useAppDispatch()
    const tagMeta = useAppSelector(state => selectTagMetaBySection(state, sectionId))

    useEffect(() => {
        dispatch(sectionMounted(sectionId))
    }, [dispatch, sectionId]);

    return (
        <SectionContainer>
            {!tagMeta ?
            <Spin size="large" /> :
            <div>
                <TagArea sectionId={sectionId} />
                <NoteArea sectionId={sectionId} />
            </div>}
        </SectionContainer>
    )
}

const SectionContainer = styled.div`
`

export default Section