import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  IssueButton,
  ButtonContainer,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filters: [
      { state: 'open', label: 'Abertos', active: false },
      { state: 'all', label: 'Todos', active: true },
      { state: 'closed', label: 'Fechados', active: false },
    ],
    filterIndex: 0,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: 'all',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleIssueButton = async (filterIndex) => {
    await this.setState({ filterIndex });
    this.loadIssues();
  };

  handlePage = async (action) => {
    const { page } = this.state;
    await this.setState({ page: action === 'next' ? page + 1 : page - 1 });
    this.loadIssues();
  };

  loadIssues = async () => {
    const { filters, filterIndex, page } = this.state;
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const res = await api.get(`repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: res.data });
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      filterIndex,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <IssueButton active={filterIndex}>
            {filters.map((filter, index) => (
              <button
                type="button"
                key={index}
                onClick={() => this.handleIssueButton(index)}
                data={filter.state}
              >
                {filter.label}
              </button>
            ))}
          </IssueButton>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <ButtonContainer>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePage('back')}
          >
            back
          </button>
          <button type="button" onClick={() => this.handlePage('next')}>
            next
          </button>
        </ButtonContainer>
      </Container>
    );
  }
}
